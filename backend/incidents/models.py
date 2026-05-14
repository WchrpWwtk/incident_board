from django.conf import settings
from django.db import models


class Incident(models.Model):
    class Status(models.TextChoices):
        NEW = "new", "New"
        IN_PROGRESS = "in_progress", "In Progress"
        PENDING_MANAGER_REVIEW = "pending_manager_review", "Pending Manager Review"
        RETURNED_TO_REPORTER = "returned_to_reporter", "Returned to Reporter"
        RESOLVED = "resolved", "Resolved"
        CANCELLED = "cancelled", "Cancelled"
        CLOSED = "closed", "Closed"

    class Priority(models.TextChoices):
        LOW = "low", "Low"
        MEDIUM = "medium", "Medium"
        HIGH = "high", "High"
        CRITICAL = "critical", "Critical"

    title = models.CharField(max_length=200)
    description = models.TextField()

    status = models.CharField(max_length=40, choices=Status, default=Status.NEW)

    priority = models.CharField(
        max_length=20, choices=Priority, default=Priority.MEDIUM
    )

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="created_incidents",
    )

    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name="assigned_incidents",
        null=True,
        blank=True,
    )

    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name="updated_incidents",
        null=True,
        blank=True,
    )

    resolved_at = models.DateTimeField(null=True, blank=True)
    closed_at = models.DateTimeField(null=True, blank=True)

    is_archived = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["status"]),
            models.Index(fields=["priority"]),
            models.Index(fields=["created_at"]),
            models.Index(fields=["is_archived"]),
        ]

    def __str__(self):
        return f"[{self.get_priority_display()}] {self.title}"
