from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from accounts.serializers import LoginSerializer, UserSummarySerializer


class LoginView(APIView):
    authentication_classes = []
    permission_classes = []

    @staticmethod
    def post(request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data["user"]

        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)

        response = Response(
            {
                "user": UserSummarySerializer(user).data,
            },
            status=status.HTTP_200_OK,
        )

        response.set_cookie(
            key="access_token",
            value=access_token,
            httponly=True,
            secure=False,  # True in production HTTPS
            samesite="Lax",
            max_age=60 * 15,
        )

        response.set_cookie(
            key="refresh_token",
            value=refresh_token,
            httponly=True,
            secure=False,  # True in production HTTPS
            samesite="Lax",
            max_age=60 * 60 * 24 * 7,
        )

        return response


class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    @staticmethod
    def get(request):
        serializer = UserSummarySerializer(request.user)

        return Response(serializer.data)


class LogoutView(APIView):
    permission_classes = []

    @staticmethod
    def post(_request):
        response = Response(
            {"detail": "Logged out successfully"}, status=status.HTTP_200_OK
        )

        response.delete_cookie("access_token", samesite="Lax")

        response.delete_cookie("refresh_token", samesite="Lax")

        return response
