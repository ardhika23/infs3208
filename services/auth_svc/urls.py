from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import logout_view, me

urlpatterns = [
    path("token/",   TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("refresh/", TokenRefreshView.as_view(),     name="token_refresh"),
    path("logout/",  logout_view,                    name="token_logout"),
    path("me/",      me,                             name="me"),
]