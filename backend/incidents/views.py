from django.db import transaction
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response

from incidents.models import Incident, IncidentActivityLog, IncidentComment
from incidents.permissions import IncidentPermission
from incidents.serializers import (
    IncidentListSerializer,
    IncidentDetailSerializer,
    IncidentCreateSerializer,
    IncidentUpdateSerializer,
    IncidentCommentSerializer,
    IncidentCommentCreateSerializer,
    IncidentAttachmentSerializer,
    IncidentAttachmentCreateSerializer,
)
from incidents.services import create_activity_log, validate_status_transition


class IncidentViewSet(viewsets.ModelViewSet):
    permission_classes = [IncidentPermission]

    filterset_fields = (
        "status",
        "priority",
        "assigned_to",
        "created_by",
    )

    search_fields = (
        "title",
        "description",
        "created_by__username",
        "assigned_to__username",
    )

    ordering_fields = (
        "created_at",
        "updated_at",
        "priority",
        "status",
    )

    ordering = ("-created_at",)

    def get_queryset(self):
        user = self.request.user

        queryset = (
            Incident.objects.select_related("created_by", "assigned_to", "updated_by")
            .filter(is_archived=False)
            .order_by("-created_at")
        )

        if user.role in ["admin", "manager"]:
            return queryset

        if user.role == "processor":
            return queryset.filter(assigned_to=user)

        return queryset.filter(created_by=user)

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

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        incident = serializer.save(created_by=request.user, updated_by=request.user)

        response_serializer = IncidentDetailSerializer(incident)

        return Response(
            response_serializer.data,
            status=status.HTTP_201_CREATED,
        )

    @transaction.atomic
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance = self.get_object()

        old_priority = instance.priority
        old_status = instance.status
        old_assigned_to = instance.assigned_to_id

        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)

        new_status = serializer.validated_data.get("status", instance.status)

        validate_status_transition(
            old_status=instance.status,
            new_status=new_status,
            user_role=request.user.role,
        )

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

    @transaction.atomic
    def destroy(self, request, *args, **kwargs):
        incident = self.get_object()

        incident.is_archived = True
        incident.updated_by = request.user
        incident.save(update_fields=["is_archived", "updated_by", "updated_at"])

        create_activity_log(
            incident=incident,
            user=request.user,
            action=IncidentActivityLog.Action.ARCHIVED,
            field_name="is_archived",
            old_value=False,
            new_value=True,
        )

        return Response(status=status.HTTP_204_NO_CONTENT)

    def get_object(self):
        obj = super().get_object()
        self.check_object_permissions(self.request, obj)

        return obj

    @action(detail=True, methods=["get", "post"], url_path="comments")
    def comments(self, request, pk=None):
        incident = self.get_object()

        if request.method == "GET":
            comments = incident.comments.select_related("user").order_by("created_at")

            serializer = IncidentCommentSerializer(comments, many=True)

            return Response(serializer.data)

        serializer = IncidentCommentCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        comment = IncidentComment.objects.create(
            incident=incident, user=request.user, body=serializer.validated_data["body"]
        )

        create_activity_log(
            incident=incident,
            user=request.user,
            action=IncidentActivityLog.Action.COMMENTED,
            field_name="comment",
            new_value=comment.body,
        )

        response_serializer = IncidentCommentSerializer(comment)

        return Response(response_serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["get", "post"], url_path="attachments")
    @transaction.atomic
    def attachments(self, request, pk=None):
        incident = self.get_object()

        if request.method == "GET":
            attachments = incident.attachments.select_related("uploaded_by").order_by(
                "-uploaded_at"
            )

            serializer = IncidentAttachmentSerializer(attachments, many=True)

            return Response(serializer.data)

        serializer = IncidentAttachmentCreateSerializer(data=request.data)

        serializer.is_valid(raise_exception=True)

        attachment = serializer.save(incident=incident, uploaded_by=request.user)

        create_activity_log(
            incident=incident,
            user=request.user,
            action=IncidentActivityLog.Action.ATTACHMENT_UPLOADED,
            field_name="attachment",
            new_value=attachment.original_name,
        )

        response_serializer = IncidentAttachmentSerializer(attachment)

        return Response(response_serializer.data, status=status.HTTP_201_CREATED)


class IncidentCommentViewSet(viewsets.GenericViewSet):
    queryset = IncidentComment.objects.select_related("incident", "user")

    permission_classes = [IncidentPermission]

    @transaction.atomic
    def destroy(self, request, *args, **kwargs):
        comment = self.get_object()

        incident = comment.incident
        comment_body = comment.body

        if (
            request.user.role not in ["admin", "manager"]
            and comment.user_id != request.user.id
        ):
            return Response(
                {"detail": "You do not have permission to delete this comment."},
                status=status.HTTP_403_FORBIDDEN,
            )

        comment.delete()

        create_activity_log(
            incident=incident,
            user=request.user,
            action=IncidentActivityLog.Action.COMMENT_DELETED,
            field_name="comment",
            old_value=comment_body,
            new_value=None,
        )

        return Response(status=status.HTTP_204_NO_CONTENT)
