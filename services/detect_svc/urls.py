from django.urls import path
from . import views

urlpatterns = [
    path("health/", views.HealthView.as_view()),
    path("upload", views.UploadView.as_view()),
    path("detect", views.DetectView.as_view()),
    path("results", views.ResultsListView.as_view()),
    path("results/<int:id>", views.ResultDetailView.as_view()),
    path("summary", views.summary),
]