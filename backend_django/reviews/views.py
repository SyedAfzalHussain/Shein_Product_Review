import requests
from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response

from .models import UserReview
from wishlist.models import WishlistItem

FASTAPI_BASE = "http://localhost:4000"


def _get_sentiment(text: str) -> dict:
    """Call FastAPI /analyze to get VADER sentiment."""
    try:
        r = requests.post(f"{FASTAPI_BASE}/analyze", json={"text": text}, timeout=5)
        return r.json()
    except Exception:
        return {"label": "Neutral", "compound": 0.0}


# ── Submit / Update a review ──────────────────────────────────────────

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def submit_review(request):
    """
    POST /api/reviews/submit/
    Body: { product_id, rating, review_text }
    Creates or updates the user's review for that product.
    """
    product_id  = request.data.get("product_id")
    rating      = request.data.get("rating")
    review_text = request.data.get("review_text", "").strip()

    if not all([product_id, rating, review_text]):
        return Response({"error": "product_id, rating, and review_text are required."}, status=400)

    if not (1 <= int(rating) <= 5):
        return Response({"error": "Rating must be between 1 and 5."}, status=400)

    # Run sentiment analysis via FastAPI
    sentiment = _get_sentiment(review_text)

    review, created = UserReview.objects.update_or_create(
        user=request.user,
        product_id=product_id,
        defaults={
            "rating":          int(rating),
            "review_text":     review_text,
            "sentiment_label": sentiment.get("label", "Neutral"),
            "sentiment_score": sentiment.get("compound", 0.0),
        },
    )

    return Response({
        "message":        "Review submitted!" if created else "Review updated!",
        "product_id":     review.product_id,
        "rating":         review.rating,
        "review_text":    review.review_text,
        "sentiment_label": review.sentiment_label,
        "sentiment_score": review.sentiment_score,
        "created_at":     review.created_at,
    }, status=201 if created else 200)


# ── Get reviews for a product ─────────────────────────────────────────

@api_view(["GET"])
@permission_classes([AllowAny])
def product_reviews(request, product_id):
    """GET /api/reviews/product/<product_id>/"""
    reviews = UserReview.objects.filter(product_id=product_id).select_related("user")
    data = [
        {
            "username":       r.user.username,
            "rating":         r.rating,
            "review_text":    r.review_text,
            "sentiment_label": r.sentiment_label,
            "sentiment_score": r.sentiment_score,
            "created_at":     r.created_at,
        }
        for r in reviews
    ]
    return Response({"product_id": product_id, "reviews": data, "count": len(data)})


# ── Delete a review ───────────────────────────────────────────────────

@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_review(request, product_id):
    """DELETE /api/reviews/<product_id>/"""
    deleted, _ = UserReview.objects.filter(user=request.user, product_id=product_id).delete()
    if deleted:
        return Response({"message": "Review deleted."})
    return Response({"error": "Review not found."}, status=404)


# ── Full user profile ─────────────────────────────────────────────────

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_profile(request):
    """
    GET /api/profile/
    Returns the logged-in user's reviews + wishlist product IDs.
    """
    user = request.user
    reviews = UserReview.objects.filter(user=user)
    wishlist_ids = list(WishlistItem.objects.filter(user=user).values_list("product_id", flat=True))

    review_data = [
        {
            "product_id":     r.product_id,
            "rating":         r.rating,
            "review_text":    r.review_text,
            "sentiment_label": r.sentiment_label,
            "sentiment_score": r.sentiment_score,
            "created_at":     str(r.created_at),
        }
        for r in reviews
    ]

    avg_rating = round(sum(r["rating"] for r in review_data) / len(review_data), 1) if review_data else 0

    return Response({
        "user": {
            "id":         user.id,
            "username":   user.username,
            "email":      user.email,
            "first_name": user.first_name,
            "last_name":  user.last_name,
            "joined":     str(user.date_joined.date()),
        },
        "stats": {
            "reviews_written": len(review_data),
            "wishlist_count":  len(wishlist_ids),
            "avg_rating_given": avg_rating,
        },
        "reviews":      review_data,
        "wishlist_ids": wishlist_ids,
    })