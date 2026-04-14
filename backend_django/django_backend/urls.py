from django.contrib import admin
from django.urls import path, include   
from reviews.views import my_profile

urlpatterns = [
    path("admin/",        admin.site.urls),
    path("api/auth/",     include("accounts.urls")),
    path("api/wishlist/", include("wishlist.urls")),
    path("api/",          include("proxy.urls")),
    path("api/reviews/", include("reviews.urls")),
    path("api/profile/", my_profile),
]