from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import RegisterSerializer, UserSerializer

from django.contrib.auth.models import User
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from rest_framework.decorators import api_view
from rest_framework.response import Response

from urllib.parse import quote

def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        "refresh": str(refresh),
        "access":  str(refresh.access_token),
    }

@api_view(['POST'])
@permission_classes([AllowAny])
def forgot_password(request):
    email = request.data.get('email')
    user = User.objects.filter(email=email).first()

    if not user:
        return Response({"error": "User not found"}, status=404)

    token = default_token_generator.make_token(user)
    uid = user.pk

    token = default_token_generator.make_token(user)
    uid = user.pk
 
    safe_token = quote(token)  # 🔥 FIX

    reset_link = f"http://localhost:3000/auth/reset-password/{uid}/{safe_token}"

    send_mail(
        'Password Reset',
        f'Click here:\n{reset_link}',  # 👈 newline BEFORE link
        'from@example.com',
        [email],
    )

    return Response({"message": "Reset link sent"})



@api_view(["POST"])
@permission_classes([AllowAny])
def register(request):
    """POST /api/auth/register/"""
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        tokens = get_tokens_for_user(user)
        return Response(
            {
                "message": "Account created successfully.",
                "user": UserSerializer(user).data,
                **tokens,
            },
            status=status.HTTP_201_CREATED,
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def me(request):
    """GET /api/auth/me/  — returns current user info"""
    return Response(UserSerializer(request.user).data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout(request):
    """POST /api/auth/logout/  — blacklists the refresh token"""
    try:
        refresh_token = request.data.get("refresh")
        token = RefreshToken(refresh_token)
        token.blacklist()
        return Response({"message": "Logged out successfully."}, status=status.HTTP_205_RESET_CONTENT)
    except Exception:
        return Response({"error": "Invalid token."}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password(request, uid, token):
    from django.contrib.auth.models import User

    try:
        user = User.objects.get(pk=uid)
    except User.DoesNotExist:
        return Response({"error": "Invalid user"}, status=400)

    if not default_token_generator.check_token(user, token):
        return Response({"error": "Invalid token"}, status=400)

    new_password = request.data.get('password')
    user.set_password(new_password)
    user.save()

    return Response({"message": "Password reset successful"})