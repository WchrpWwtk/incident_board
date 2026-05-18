from django.urls import path
from rest_framework.routers import DefaultRouter

from incidents.views import IncidentViewSet, IncidentCommentViewSet, DashboardView

router = DefaultRouter()
router.register("incidents", IncidentViewSet, basename="incident")
router.register("comments", IncidentCommentViewSet, basename="comment")

urlpatterns = [
    path("dashboard/", DashboardView.as_view(), name="dashboard")
] + router.urls
