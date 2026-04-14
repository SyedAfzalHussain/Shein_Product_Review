from django.db import models
from django.contrib.auth.models import User


class UserReview(models.Model):
    user       = models.ForeignKey(User, on_delete=models.CASCADE, related_name="reviews")
    product_id = models.IntegerField()
    rating     = models.IntegerField(choices=[(i, i) for i in range(1, 6)])
    review_text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    # Filled automatically after save
    sentiment_label = models.CharField(max_length=20, blank=True)
    sentiment_score = models.FloatField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]
        unique_together = ("user", "product_id")   # one review per product per user

    def __str__(self):
        return f"{self.user.username} → product {self.product_id} ({self.rating}★)"