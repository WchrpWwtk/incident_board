from django.contrib.auth.base_user import AbstractBaseUser
from rest_framework.permissions import BasePermission


class IncidentPermission(BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        return True

    def has_object_permission(self, request, view, obj):
        user = request.user

        if user.role in ["admin", "manager"]:
            return True

        if request.method in ["GET", "HEAD", "OPTIONS"]:
            return True

        if request.method == "DELETE":
            return False

        if user.role == "processor":
            return obj.assigned_to_id == user.id

        return obj.created_by_id == user.id
