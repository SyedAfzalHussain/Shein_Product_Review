from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import WishlistItem


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_wishlist(request):
    """GET /api/wishlist/  — returns all saved product IDs for the logged-in user"""
    ids = list(
        WishlistItem.objects.filter(user=request.user).values_list("product_id", flat=True)
    )
    return Response({"product_ids": ids, "count": len(ids)})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def toggle_wishlist(request):
    """
    POST /api/wishlist/toggle/
    Body: { "product_id": 42 }
    Returns: { "saved": true/false, "product_id": 42 }
    """
    product_id = request.data.get("product_id")
    if not product_id:
        return Response({"error": "product_id is required"}, status=status.HTTP_400_BAD_REQUEST)

    item, created = WishlistItem.objects.get_or_create(
        user=request.user, product_id=product_id
    )
    if not created:
        # already saved → remove it
        item.delete()
        return Response({"saved": False, "product_id": product_id})

    return Response({"saved": True, "product_id": product_id}, status=status.HTTP_201_CREATED)


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def remove_from_wishlist(request, product_id):
    """DELETE /api/wishlist/<product_id>/"""
    deleted, _ = WishlistItem.objects.filter(
        user=request.user, product_id=product_id
    ).delete()
    if deleted:
        return Response({"removed": True}, status=status.HTTP_200_OK)
    return Response({"error": "Not in wishlist"}, status=status.HTTP_404_NOT_FOUND)