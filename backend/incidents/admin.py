from django.contrib import admin

from incidents.models import Incident


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
