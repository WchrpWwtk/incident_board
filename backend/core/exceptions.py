from rest_framework import status
from rest_framework.exceptions import APIException


class WorkflowValidationError(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = "Workflow validation failed."
    default_code = "workflow_validation_error"
