from django.db import models
from django.contrib.auth.models import User


class WishlistItem(models.Model):
    user       = models.ForeignKey(User, on_delete=models.CASCADE, related_name="wishlist")
    product_id = models.IntegerField()          # matches product_id from FastAPI/CSV
    added_at   = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "product_id")  # no duplicates
        ordering = ["-added_at"]

    def __str__(self):
        return f"{self.user.username} → product {self.product_id}"