from django.urls import path

from accounts.views import LoginView, ProfileView, LogoutView, RefreshView

urlpatterns = [
    path("login/", LoginView.as_view(), name="login"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("profile/", ProfileView.as_view(), name="profile"),
    path("refresh/", RefreshView.as_view(), name="refresh"),
]
