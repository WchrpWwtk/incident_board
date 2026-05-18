from rest_framework import serializers

from accounts.serializers import UserSummarySerializer
from incidents.models import Incident, IncidentComment, IncidentAttachment


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


class IncidentUpdateSerializer(serializers.ModelSerializer):
    title = serializers.CharField(required=False, allow_blank=False, max_length=200)
    description = serializers.CharField(required=False, allow_blank=False)
    priority = serializers.ChoiceField(choices=Incident.Priority, required=False)
    assigned_to_id = serializers.IntegerField(
        required=False, allow_null=True, write_only=True
    )
    status = serializers.ChoiceField(choices=Incident.Status, required=False)

    class Meta:
        model = Incident
        fields = (
            "title",
            "description",
            "priority",
            "assigned_to_id",
            "status",
        )

    @staticmethod
    def validate_title(value):
        value = value.strip()

        if len(value) < 3:
            raise serializers.ValidationError("Title must be at least 3 characters.")

        return value

    @staticmethod
    def validate_description(value):
        value = value.strip()

        if len(value) < 10:
            raise serializers.ValidationError(
                "Description must be at least 10 characters."
            )

        return value


class IncidentCommentSerializer(serializers.ModelSerializer):
    user = UserSummarySerializer(read_only=True)

    class Meta:
        model = IncidentComment
        fields = (
            "id",
            "incident",
            "user",
            "body",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "id",
            "incident",
            "user",
            "created_at",
            "updated_at",
        )


class IncidentCommentCreateSerializer(serializers.ModelSerializer):
    body = serializers.CharField(required=True, allow_blank=False)

    class Meta:
        model = IncidentComment
        fields = ("body",)

    @staticmethod
    def validate_body(value):
        value = value.strip()

        if len(value) < 2:
            raise serializers.ValidationError("Comment must be at least 2 characters.")

        return value


class IncidentAttachmentSerializer(serializers.ModelSerializer):
    uploaded_by = UserSummarySerializer(read_only=True)

    class Meta:
        model = IncidentAttachment
        fields = (
            "id",
            "incident",
            "uploaded_by",
            "file",
            "original_name",
            "content_type",
            "size",
            "uploaded_at",
        )
        read_only_fields = (
            "id",
            "incident",
            "uploaded_by",
            "original_name",
            "content_type",
            "size",
            "uploaded_at",
        )


class IncidentAttachmentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = IncidentAttachment
        fields = ("file",)

    @staticmethod
    def validate_file(value):
        max_size = 10 * 1024 * 1024

        if value.size > max_size:
            raise serializers.ValidationError("File size must not exceed 10 MB.")

        return value
