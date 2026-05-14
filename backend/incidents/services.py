from incidents.models import IncidentActivityLog


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
