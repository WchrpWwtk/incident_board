from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from sentry_sdk.integrations.beam import raise_exception

from incidents.models import Incident, IncidentActivityLog
from incidents.serializers import (
    IncidentListSerializer,
    IncidentDetailSerializer,
    IncidentCreateSerializer,
    IncidentUpdateSerializer,
)
from incidents.services import create_activity_log


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

        if self.action in ["update", "partial_update"]:
            return IncidentUpdateSerializer

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

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance = self.get_object()

        old_priority = instance.priority
        old_status = instance.status
        old_assigned_to = instance.assigned_to_id

        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)

        incident = serializer.save(updated_by=request.user)

        if old_priority != incident.priority:
            create_activity_log(
                incident=incident,
                user=request.user,
                action=IncidentActivityLog.Action.PRIORITY_CHANGED,
                field_name="priority",
                old_value=old_priority,
                new_value=incident.priority,
            )

        if old_status != incident.status:
            create_activity_log(
                incident=incident,
                user=request.user,
                action=IncidentActivityLog.Action.STATUS_CHANGED,
                field_name="status",
                old_value=old_status,
                new_value=incident.status,
            )

        if old_assigned_to != incident.assigned_to_id:
            create_activity_log(
                incident=incident,
                user=request.user,
                action=IncidentActivityLog.Action.ASSIGNED,
                field_name="assigned_to",
                old_value=old_assigned_to,
                new_value=incident.assigned_to_id,
            )

        response_serializer = IncidentDetailSerializer(incident)

        return Response(response_serializer.data)
