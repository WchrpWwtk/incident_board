import { AxiosError } from "axios";

type ApiErrorResponse = {
	detail?: string;
	message?: string;
	[key: string]: unknown;
};

export function getApiErrorMessage(error: unknown) {
	if (error instanceof AxiosError) {
		const data = error.response?.data as ApiErrorResponse | undefined;

		if (data?.detail) return data.detail;
		if (data?.message) return data.message;

		if (error.response?.status === 403) {
			return "You do not have permission to perform this action.";
		}

		if (error.response?.status === 404) {
			return "The requested resource was not found.";
		}

		if (error.response?.status && error.response.status >= 500) {
			return "Server error. Please try again later.";
		}
	}

	return "Something went wrong. Please try again.";
}
