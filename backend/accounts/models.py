from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = "admin", "Admin"
        REPORTER = "reporter", "Reporter"
        PROCESSOR = "processor", "Processor"
        MANAGER = "manager", "Manager"

    role = models.CharField(max_length=20, choices=Role, default=Role.REPORTER)
