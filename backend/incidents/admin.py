from django.contrib import admin

from incidents.models import (
    Incident,
    IncidentActivityLog,
    IncidentComment,
    IncidentAttachment,
    ReportExport,
)


@admin.register(Incident)
class IncidentAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "title",
        "status",
        "priority",
        "created_at",
        "assigned_to",
        "is_archived",
        "created_at",
    )

    list_filter = (
        "status",
        "priority",
        "is_archived",
        "created_at",
    )

    search_fields = (
        "title",
        "description",
        "created_by__username",
        "assigned_to__username",
    )

    readonly_fields = (
        "created_at",
        "updated_at",
        "resolved_at",
        "closed_at",
    )


@admin.register(IncidentActivityLog)
class IncidentActivityLogAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "incident",
        "action",
        "user",
        "field_name",
        "created_at",
    )

    list_filter = (
        "action",
        "created_at",
    )

    search_fields = (
        "incident__title",
        "user__username",
    )

    readonly_fields = ("created_at",)


@admin.register(IncidentComment)
class IncidentCommentAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "incident",
        "user",
        "created_at",
    )

    search_fields = (
        "incident__title",
        "user__username",
        "body",
    )

    readonly_fields = (
        "created_at",
        "updated_at",
    )


@admin.register(IncidentAttachment)
class IncidentAttachmentAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "incident",
        "original_name",
        "uploaded_by",
        "size",
        "uploaded_at",
    )

    search_fields = (
        "incident__title",
        "original_name",
    )

    readonly_fields = ("uploaded_at",)


@admin.register(ReportExport)
class ReportExportAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "exported_by",
        "status",
        "row_count",
        "exported_at",
    )

    list_filter = (
        "status",
        "exported_at",
    )

    search_fields = ("exported_by__username",)

    readonly_fields = ("exported_at",)
