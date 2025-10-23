from django.urls import path
from .views import (
    HealthView, UploadView, DetectView,
    ResultsListView, ResultDetailView, summary
)

urlpatterns = [
    path("health", HealthView.as_view()),
    path("upload", UploadView.as_view()),      # POST /api/detect/upload
    path("detect", DetectView.as_view()),      # POST /api/detect/detect
    path("results", ResultsListView.as_view()),               # GET
    path("results/<uuid:id>", ResultDetailView.as_view()),    # GET
    path("summary", summary),                                   # GET
]