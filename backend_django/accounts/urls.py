from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from . import views

urlpatterns = [
    # Register
    path("register/", views.register, name="auth-register"),

    # Login  → returns access + refresh tokens
    path("login/",    TokenObtainPairView.as_view(),  name="auth-login"),

    # Refresh access token
    path("token/refresh/", TokenRefreshView.as_view(), name="auth-token-refresh"),

    # Current user info (requires Authorization: Bearer <access>)
    path("me/",       views.me,       name="auth-me"),

    # Logout (blacklists refresh token)
    path("logout/",   views.logout,   name="auth-logout"),
]