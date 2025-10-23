import os
import statistics
from datetime import timedelta

import requests
from django.conf import settings
from django.utils import timezone
from django.db.models import Count, Avg, Sum
from django.db.models.functions import TruncDate

from rest_framework import views, generics
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated

from .models import Detection, DetectionItem
from .serializers import DetectionSerializer
from .services import call_inference, draw_boxes_and_save


class HealthView(views.APIView):
    permission_classes = [AllowAny]
    def get(self, _):
        return Response({"status": "ok"})


class UploadView(views.APIView):
    """
    Terima file gambar dan simpan ke MEDIA_ROOT/uploads, return {file_id, file_url}
    """
    parser_classes = (MultiPartParser, FormParser)
    permission_classes = [IsAuthenticated]

    def post(self, request):
        f = request.FILES.get("file")
        if not f:
            return Response({"detail": "file required"}, status=400)
        if f.size > 20 * 1024 * 1024:
            return Response({"detail": "file too large"}, status=413)
        if f.content_type not in ("image/jpeg", "image/png"):
            return Response({"detail": "only jpg/png"}, status=415)

        save_dir = os.path.join(settings.MEDIA_ROOT, "uploads")
        os.makedirs(save_dir, exist_ok=True)

        fname = f"{timezone.now().strftime('%Y%m%d%H%M%S')}_{f.name}"
        fpath = os.path.join(save_dir, fname)
        with open(fpath, "wb+") as dst:
            for c in f.chunks():
                dst.write(c)

        return Response({
            "file_id": fname,
            "file_url": settings.MEDIA_URL + "uploads/" + fname
        })


class DetectView(views.APIView):
    """
    Jalankan inferensi untuk file yang sudah diupload.
    """
    parser_classes = (JSONParser,)
    permission_classes = [IsAuthenticated]

    def post(self, request):
        file_id = request.data.get("file_id")
        if not file_id:
            return Response({"detail": "file_id required"}, status=400)

        src_path = os.path.join(settings.MEDIA_ROOT, "uploads", file_id)
        if not os.path.exists(src_path):
            return Response({"detail": "file not found"}, status=404)

        # panggil inference, tangkap error jaringan supaya 502 bukan 500
        try:
            result = call_inference(src_path)
        except (requests.ConnectionError, requests.Timeout) as e:
            return Response(
                {"detail": f"inference backend unavailable: {e.__class__.__name__}"},
                status=502
            )
        except Exception as e:
            return Response({"detail": f"inference error: {e}"}, status=500)

        items = result.get("items", [])

        det = Detection.objects.create(
            filename=file_id,
            file_url=settings.MEDIA_URL + "uploads/" + file_id,
            model_version=result.get("model_version", "1.0"),
            pod_id=result.get("pod_id", "inference-local"),
            total_objects=len(items),
            avg_conf=statistics.fmean([i["confidence"] for i in items]) if items else 0.0,
        )

        DetectionItem.objects.bulk_create([
            DetectionItem(detection=det, **i) for i in items
        ])

        annotated_url = draw_boxes_and_save(src_path, items) if items else None
        if annotated_url:
            det.annotated_url = annotated_url
            det.save(update_fields=["annotated_url"])

        return Response(DetectionSerializer(det).data)


class ResultsListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = DetectionSerializer
    queryset = Detection.objects.all().order_by("-created_at")


class ResultDetailView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = DetectionSerializer
    queryset = Detection.objects.all()
    lookup_field = "id"


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def summary(request):
    """
    GET ?days=7 (1..90)
    """
    try:
        days = int(request.GET.get("days", "7"))
        days = max(1, min(days, 90))
    except ValueError:
        days = 7

    end = timezone.now()
    start = end - timedelta(days=days)

    q = Detection.objects.filter(created_at__gte=start, created_at__lte=end).order_by("-created_at")

    total_images = q.count()
    total_objects = q.aggregate(s=Sum("total_objects"))["s"] or 0
    avg_conf = q.aggregate(a=Avg("avg_conf"))["a"] or 0.0

    per_day = (
        q.annotate(day=TruncDate("created_at"))
         .values("day")
         .annotate(images=Count("id"), avg_conf=Avg("avg_conf"), objects=Sum("total_objects"))
         .order_by("day")
    )
    series = [{
        "date": d["day"].isoformat(),
        "images": d["images"],
        "avg_conf": round(float(d["avg_conf"] or 0.0), 3),
        "objects": int(d["objects"] or 0),
    } for d in per_day]

    items_q = DetectionItem.objects.filter(detection__in=q)
    per_class = items_q.values("klass").annotate(count=Count("id")).order_by("-count")
    by_class = [{"klass": r["klass"] or "Unknown", "count": r["count"]} for r in per_class]

    latest = [{
        "id": r.id,
        "created_at": r.created_at.isoformat(),
        "filename": r.filename,
        "annotated_url": r.annotated_url,
        "file_url": r.file_url,
        "total_objects": r.total_objects or 0,
        "avg_conf": round(float(r.avg_conf or 0.0), 3),
    } for r in q[:5]]

    return Response({
        "range_days": days,
        "total_images": total_images,
        "total_objects": total_objects,
        "avg_conf": round(float(avg_conf), 3),
        "series": series,
        "by_class": by_class,
        "latest": latest,
    })