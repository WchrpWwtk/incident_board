from django.urls import path
from rest_framework.routers import DefaultRouter

from incidents.views import (
    IncidentViewSet,
    IncidentCommentViewSet,
    DashboardView,
    ReportExportView,
    SentryTestView, IncidentAttachmentViewSet,
)

router = DefaultRouter()
router.register("incidents", IncidentViewSet, basename="incident")
router.register("comments", IncidentCommentViewSet, basename="comment")
router.register("attachments", IncidentAttachmentViewSet, basename="attachment")

urlpatterns = [
    path("dashboard/", DashboardView.as_view(), name="dashboard"),
    path("reports/export/", ReportExportView.as_view(), name="report-export"),
    path("sentry-test/", SentryTestView.as_view(), name="sentry-test"),
] + router.urls
