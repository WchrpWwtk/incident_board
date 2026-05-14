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


class IncidentActivityLog(models.Model):
    class Action(models.TextChoices):
        CREATED = "created", "Created"
        UPDATED = "updated", "Updated"
        STATUS_CHANGED = "status_changed", "Status Changed"
        PRIORITY_CHANGED = "priority_changed", "Priority Changed"
        ASSIGNED = "assigned", "Assigned"
        COMMENTED = "commented", "Commented"
        ATTACHMENT_UPLOADED = "attachment_uploaded", "Attachment Uploaded"
        RETURNED = "returned", "Returned"
        RESOLVED = "resolved", "Resolved"
        CANCELLED = "cancelled", "Cancelled"
        CLOSED = "closed", "Closed"
        ARCHIVED = "archived", "Archived"

    incident = models.ForeignKey(
        Incident,
        on_delete=models.CASCADE,
        related_name="activity_logs",
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True
    )

    action = models.CharField(max_length=50, choices=Action)

    field_name = models.CharField(max_length=100, null=True, blank=True)

    old_value = models.TextField(null=True, blank=True)

    new_value = models.TextField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.action} - Incident #{self.incident_id}"


class IncidentComment(models.Model):
    incident = models.ForeignKey(
        Incident, on_delete=models.CASCADE, related_name="comments"
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True
    )

    body = models.TextField()

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"Comment on Incident #{self.incident_id}"


class IncidentAttachment(models.Model):
    incident = models.ForeignKey(
        Incident, on_delete=models.CASCADE, related_name="attachments"
    )

    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True
    )

    file = models.FileField(upload_to="incident_attachments/")

    original_name = models.CharField(max_length=255)

    content_type = models.CharField(max_length=100, blank=True)

    size = models.PositiveIntegerField(default=0)

    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-uploaded_at"]

    def __str__(self):
        return self.original_name

    def save(self, *args, **kwargs):
        if self.file:
            self.original_name = self.file.name
            self.size = self.file.size
            self.content_type = getattr(self.file.file, "content_type", "")

        super().save(*args, **kwargs)
