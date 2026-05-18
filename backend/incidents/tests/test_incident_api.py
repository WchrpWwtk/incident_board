import pytest
from rest_framework.test import APIClient

from incidents.models import IncidentActivityLog
from incidents.tests.factories import UserFactory, IncidentFactory


@pytest.mark.django_db
def test_incident_list_returns_200():
    user = UserFactory(role="admin")

    IncidentFactory.create_batch(3, created_by=user)

    client = APIClient()

    client.force_authenticate(user=user)

    response = client.get("/api/incidents/")

    assert response.status_code == 200
    assert response.data["count"] == 3


@pytest.mark.django_db
def test_reporter_sees_only_own_incidents():
    reporter = UserFactory(role="reporter")
    other_user = UserFactory(role="reporter")

    IncidentFactory(created_by=reporter)
    IncidentFactory(created_by=other_user)

    client = APIClient()
    client.force_authenticate(user=reporter)

    response = client.get("/api/incidents/")

    assert response.status_code == 200
    assert response.data["count"] == 1


@pytest.mark.django_db
def test_create_incident_sets_created_by():
    user = UserFactory(role="reporter")

    client = APIClient()
    client.force_authenticate(user=user)

    response = client.post(
        "/api/incidents/",
        {
            "title": "Cannot export report",
            "description": "Export report fails when user clicks export button.",
            "priority": "high",
        },
        format="json",
    )

    assert response.status_code == 201
    assert response.data["created_by"]["id"] == user.id
    assert response.data["status"] == "new"


@pytest.mark.django_db
def test_delete_incident_archives_instead_of_hard_delete():
    admin = UserFactory(role="admin")
    incident = IncidentFactory(created_by=admin)

    client = APIClient()
    client.force_authenticate(user=admin)

    response = client.delete(f"/api/incidents/{incident.id}/")

    assert response.status_code == 204

    incident.refresh_from_db()
    assert incident.is_archived is True

    assert IncidentActivityLog.objects.filter(
        incident=incident, action=IncidentActivityLog.Action.ARCHIVED
    ).exists()


@pytest.mark.django_db
def test_processor_can_move_new_to_in_progress():
    processor = UserFactory(role="processor")
    incident = IncidentFactory(
        created_by=UserFactory(role="reporter"),
        assigned_to=processor,
        status="new",
    )

    client = APIClient()
    client.force_authenticate(user=processor)

    response = client.patch(
        f"/api/incidents/{incident.id}/",
        {"status": "in_progress"},
        format="json",
    )

    assert response.status_code == 200
    assert response.data["status"] == "in_progress"

    assert IncidentActivityLog.objects.filter(
        incident=incident,
        action=IncidentActivityLog.Action.STATUS_CHANGED,
        old_value="new",
        new_value="in_progress",
    ).exists()


@pytest.mark.django_db
def test_reporter_cannot_move_new_to_in_progress():
    reporter = UserFactory(role="reporter")
    incident = IncidentFactory(created_by=reporter, status="new")

    client = APIClient()
    client.force_authenticate(user=reporter)

    response = client.patch(
        f"/api/incidents/{incident.id}/",
        {"status": "in_progress"},
        format="json",
    )

    assert response.status_code == 400
    assert "permission" in str(response.data["detail"]).lower()
