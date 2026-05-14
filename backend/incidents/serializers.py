from rest_framework import serializers

from accounts.serializers import UserSummarySerializer
from incidents.models import Incident


class IncidentListSerializer(serializers.ModelSerializer):
    created_by = UserSummarySerializer(read_only=True)
    assigned_to = UserSummarySerializer(read_only=True)

    class Meta:
        model = Incident
        fields = (
            "id",
            "title",
            "description",
            "status",
            "priority",
            "created_by",
            "assigned_to",
            "is_archived",
            "created_at",
            "updated_at",
        )


class IncidentDetailSerializer(serializers.ModelSerializer):
    created_by = UserSummarySerializer(read_only=True)
    assigned_to = UserSummarySerializer(read_only=True)
    updated_by = UserSummarySerializer(read_only=True)

    class Meta:
        model = Incident
        fields = (
            "id",
            "title",
            "description",
            "status",
            "priority",
            "created_by",
            "assigned_to",
            "updated_by",
            "resolved_at",
            "closed_at",
            "is_archived",
            "created_at",
            "updated_at",
        )


class IncidentCreateSerializer(serializers.ModelSerializer):
    title = serializers.CharField(required=True, allow_blank=False, max_length=200)
    description = serializers.CharField(required=True, allow_blank=False)
    priority = serializers.ChoiceField(choices=Incident.Priority)

    class Meta:
        model = Incident
        fields = (
            "title",
            "description",
            "priority",
        )

    @staticmethod
    def validate_title(value):
        if len(value.strip()) < 3:
            raise serializers.ValidationError("Title must be at least 3 characters.")

        return value.strip()

    @staticmethod
    def validate_description(value):
        if len(value.strip()) < 10:
            raise serializers.ValidationError(
                "Description must be at least 10 characters."
            )

        return value.strip()
