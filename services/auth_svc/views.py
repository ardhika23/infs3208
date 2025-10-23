from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken

@api_view(["POST"])
@permission_classes([AllowAny])
def logout_view(request):
    token = request.data.get("refresh")
    if not token:
        return Response({"detail":"refresh token required"}, status=400)
    try:
        RefreshToken(token).blacklist()
        return Response({"detail":"logged out"}, status=200)
    except Exception:
        return Response({"detail":"invalid refresh token"}, status=400)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def me(request):
    u = request.user
    return Response({"id":u.id, "username":u.username, "email":u.email})