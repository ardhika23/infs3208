from django.db import models
import uuid

class Detection(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    filename = models.CharField(max_length=255)
    file_url = models.TextField()
    annotated_url = models.TextField(null=True, blank=True)
    model_version = models.CharField(max_length=20, default="1.0")
    pod_id = models.CharField(max_length=64, blank=True, default="")
    total_objects = models.IntegerField(default=0)
    avg_conf = models.FloatField(default=0.0)
    created_at = models.DateTimeField(auto_now_add=True)

class DetectionItem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    detection = models.ForeignKey(Detection, related_name="items", on_delete=models.CASCADE)
    klass = models.CharField(max_length=50)
    confidence = models.FloatField()
    x = models.IntegerField()
    y = models.IntegerField()
    w = models.IntegerField()
    h = models.IntegerField()