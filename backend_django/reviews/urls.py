from django.urls import path
from . import views

urlpatterns = [
    path("submit/",                  views.submit_review,   name="review-submit"),
    path("product/<int:product_id>/", views.product_reviews, name="review-product"),
    path("<int:product_id>/",        views.delete_review,   name="review-delete"),
]