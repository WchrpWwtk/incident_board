from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from sentry_sdk.integrations.beam import raise_exception

from incidents.models import Incident
from incidents.serializers import (
    IncidentListSerializer,
    IncidentDetailSerializer,
    IncidentCreateSerializer,
)


class IncidentViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return (
            Incident.objects.select_related("created_by", "assigned_to", "updated_by")
            .filter(is_archived=False)
            .order_by("-created_at")
        )

    def get_serializer_class(self):
        if self.action == "list":
            return IncidentListSerializer

        if self.action == "retrieve":
            return IncidentDetailSerializer

        if self.action == "create":
            return IncidentCreateSerializer

        return IncidentDetailSerializer

    def perform_create(self, serializer):
        serializer.save(
            created_by=self.request.user,
            updated_by=self.request.user,
        )

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        incident = serializer.save(created_by=request.user, updated_by=request.user)

        response_serializer = IncidentDetailSerializer(incident)

        return Response(
            response_serializer.data,
            status=status.HTTP_201_CREATED,
        )
