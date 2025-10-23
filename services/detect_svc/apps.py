# services/detect_svc/detectsvc/apps.py
from django.apps import AppConfig

class DetectsvcConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "detect_svc"   # <-- penting: path paket yang benar
    label = "detections"             # label bebas (hindari bentrok)