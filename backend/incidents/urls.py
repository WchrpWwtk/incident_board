from rest_framework.routers import DefaultRouter

from incidents.views import IncidentViewSet, IncidentCommentViewSet

router = DefaultRouter()
router.register("incidents", IncidentViewSet, basename="incident")
router.register("comments", IncidentCommentViewSet, basename="comment")

urlpatterns = router.urls
