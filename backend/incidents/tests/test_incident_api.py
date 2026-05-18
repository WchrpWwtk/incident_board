import pytest
from rest_framework.test import APIClient

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
