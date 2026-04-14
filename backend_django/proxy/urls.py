from django.urls import path
from . import views

urlpatterns = [
    path("products/", views.products_list, name="proxy-products"),
    path("products/<int:product_id>/", views.product_detail, name="proxy-product-detail"),
    path("categories/", views.categories, name="proxy-categories"),
    path("dashboard/stats/", views.dashboard_stats, name="proxy-dashboard"),
    path("analyze/", views.analyze, name="proxy-analyze"),
]