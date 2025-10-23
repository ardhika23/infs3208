from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse

# JWT views
from rest_framework_simplejwt.views import (
    TokenObtainPairView,   # POST /api/auth/token/
    TokenRefreshView,      # POST /api/auth/token/refresh/
    TokenVerifyView,       # (opsional) POST /api/auth/token/verify/
)

def health(_):
    return JsonResponse({"status": "ok"})

urlpatterns = [
    path("", health),
    path("api/health/", health),

    # Auth (JWT) – pakai views langsung, bukan include()
    path("api/auth/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/auth/token/verify/", TokenVerifyView.as_view(), name="token_verify"),  # optional

    # Detect service
    path("api/detect/", include("detect_svc.urls")),

    path("admin/", admin.site.urls),
]

# Serve media saat DEBUG
from django.conf import settings
from django.conf.urls.static import static
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)