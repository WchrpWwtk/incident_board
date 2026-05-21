from django.db import transaction
from django.db.models import Count
from django.http import HttpResponse
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

from incidents.models import (
    Incident,
    IncidentActivityLog,
    IncidentComment,
    ReportExport,
    IncidentAttachment,
)
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
    DashboardSerializer,
    IncidentActivityLogSerializer,
)
from incidents.services import (
    create_activity_log,
    validate_status_transition,
    build_incidents_csv,
)


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

    @action(detail=True, methods=["get"], url_path="activity-logs")
    def activity_logs(self, _request, pk=None):
        incident = self.get_object()

        logs = incident.activity_logs.select_related("user").order_by("-created_at")

        serializer = IncidentActivityLogSerializer(logs, many=True)

        return Response(serializer.data)


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


class IncidentAttachmentViewSet(viewsets.GenericViewSet):
    queryset = IncidentAttachment.objects.select_related("incident", "uploaded_by")

    permission_classes = [IncidentPermission]

    @transaction.atomic
    def destroy(self, request, *args, **kwargs):
        attachment = self.get_object()

        incident = attachment.incident
        original_name = attachment.original_name

        if (
            request.user.role not in ["admin", "manager"]
            and attachment.uploaded_by_id != request.user.id
        ):
            return Response(
                {"detail": "You do not have permission to delete this attachment."},
                status=status.HTTP_403_FORBIDDEN,
            )

        attachment.delete()

        create_activity_log(
            incident=incident,
            user=request.user,
            action=IncidentActivityLog.Action.ATTACHMENT_DELETED,
            field_name="attachment",
            old_value=original_name,
            new_value=None,
        )

        return Response(status=status.HTTP_204_NO_CONTENT)


class DashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @staticmethod
    def get(request):
        queryset = Incident.objects.filter(is_archived=False)

        user = request.user

        if user.role == "processor":
            queryset = queryset.filter(assigned_to=user)

        elif user.role == "reporter":
            queryset = queryset.filter(created_by=user)

        total_incidents = queryset.count()

        total_open_incidents = queryset.exclude(
            status__in=["closed", "cancelled"]
        ).count()

        total_closed_incidents = queryset.filter(status="closed").count()

        total_critical_incidents = queryset.filter(priority="critical").count()

        status_counts = queryset.values("status").annotate(count=Count("id"))

        priority_counts = queryset.values("priority").annotate(count=Count("id"))

        incidents_by_status = {item["status"]: item["count"] for item in status_counts}

        incidents_by_priority = {
            item["priority"]: item["count"] for item in priority_counts
        }

        serializer = DashboardSerializer(
            {
                "total_incidents": total_incidents,
                "total_open_incidents": total_open_incidents,
                "total_closed_incidents": total_closed_incidents,
                "total_critical_incidents": total_critical_incidents,
                "incidents_by_status": incidents_by_status,
                "incidents_by_priority": incidents_by_priority,
            }
        )

        return Response(serializer.data)


class ReportExportView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @staticmethod
    def post(request):
        user = request.user

        queryset = (
            Incident.objects.select_related("created_by", "assigned_to")
            .filter(is_archived=False)
            .order_by("-created_at")
        )

        if user.role == "processor":
            queryset = queryset.filter(assigned_to=user)
        elif user.role == "reporter":
            queryset = queryset.filter(created_by=user)

        status_filter = request.data.get("status")
        priority_filter = request.data.get("priority")

        if status_filter:
            queryset = queryset.filter(status=status_filter)

        if priority_filter:
            queryset = queryset.filter(priority=priority_filter)

        report = ReportExport.objects.create(
            exported_by=user,
            filters={
                "status": status_filter,
                "priority": priority_filter,
            },
            status=ReportExport.Status.PROCESSING,
        )

        try:
            csv_content = build_incidents_csv(queryset)

            report.status = ReportExport.Status.SUCCESS
            report.row_count = queryset.count()
            report.save(update_fields=["status", "row_count"])
        except Exception as exc:
            report.status = ReportExport.Status.FAILED
            report.error_message = str(exc)
            report.save(update_fields=["status", "error_message"])
            raise

        response = HttpResponse(
            csv_content,
            content_type="text/csv",
        )
        response["Content-Disposition"] = 'attachment; filename="incident-report.csv"'

        return response


class SentryTestView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @staticmethod
    def get(request):
        division_by_zero = 1 / 0

        return Response(
            {
                "message": division_by_zero,
            }
        )
