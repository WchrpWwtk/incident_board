import csv
import io

from core.exceptions import WorkflowValidationError
from incidents.models import IncidentActivityLog, Incident

WORKFLOW_TRANSITIONS = {
    ("new", "in_progress"): ["processor", "admin"],
    ("in_progress", "pending_manager_review"): ["processor", "admin"],
    ("pending_manager_review", "returned_to_reporter"): ["manager", "admin"],
    ("pending_manager_review", "resolved"): ["manager", "admin"],
    ("resolved", "closed"): ["manager", "admin"],
}


def create_activity_log(
    *, incident, user, action, field_name=None, old_value=None, new_value=None
):
    IncidentActivityLog.objects.create(
        incident=incident,
        user=user,
        action=action,
        field_name=field_name,
        old_value=str(old_value) if old_value is not None else None,
        new_value=str(new_value) if new_value is not None else None,
    )


def validate_status_transition(*, old_status, new_status, user_role):
    if old_status == new_status:
        return

    if new_status == "cancelled":
        if user_role not in ["admin", "manager"]:
            raise WorkflowValidationError(
                "You do not have permission to cancel this incident."
            )

        return

    allowed_roles = WORKFLOW_TRANSITIONS.get((old_status, new_status))

    if not allowed_roles:
        raise WorkflowValidationError(
            f"Invalid status transition from {old_status} to {new_status}."
        )

    if user_role not in allowed_roles:
        raise WorkflowValidationError(
            "You do not have permission to perform this action."
        )


def build_incidents_csv(incidents):
    buffer = io.StringIO()

    writer = csv.writer(buffer)

    writer.writerow(
        [
            "ID",
            "Title",
            "Status",
            "Priority",
            "Created By",
            "Assigned To",
            "Created At",
            "Updated At",
        ]
    )

    for incident in incidents:
        writer.writerow(
            [
                incident.id,
                incident.title,
                incident.status,
                incident.priority,
                incident.created_by.username if incident.created_by else "",
                incident.assigned_to.username if incident.assigned_to else "",
                incident.created_at.isoformat(),
                incident.updated_at.isoformat(),
            ]
        )

    return buffer.getvalue()
