import factory.django
from django.contrib.auth import get_user_model

from incidents.models import Incident

User = get_user_model()


class UserFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = User

    username = factory.Sequence(lambda n: f"user{n}")

    email = factory.LazyAttribute(lambda obj: f"{obj.username}@example.com")

    password = factory.PostGenerationMethodCall("set_password", "password123")

    role = "reporter"


class IncidentFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Incident

    title = factory.Sequence(lambda n: f"Incident {n}")

    description = "Test incident description"

    priority = Incident.Priority.MEDIUM

    created_by = factory.SubFactory(UserFactory)

    updated_by = factory.SelfAttribute("created_by")
