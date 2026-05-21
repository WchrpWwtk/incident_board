import type {
	Incident,
	IncidentComment,
	IncidentStatus,
	PaginatedResponse,
} from "@/features/incidents/incident.types.ts";
import { api } from "@/lib/api.ts";
import type {
	CreateIncidentFormValues,
	UpdateIncidentFormValues,
} from "@/features/incidents/incident.schema.ts";

type GetIncidentsParams = {
	search?: string;
	status?: string;
	priority?: string;
};

type ExportIncidentParams = {
	status?: string;
	priority?: string;
};

export async function getIncidents(
	params?: GetIncidentsParams,
): Promise<PaginatedResponse<Incident>> {
	const response = await api.get<PaginatedResponse<Incident>>("/incidents/", {
		params,
	});

	return response.data;
}

export async function getIncident(id: string): Promise<Incident> {
	const response = await api.get<Incident>(`/incidents/${id}/`);

	return response.data;
}

export async function createIncident(
	payload: CreateIncidentFormValues,
): Promise<Incident> {
	const response = await api.post<Incident>("/incidents/", payload);

	return response.data;
}

export async function updateIncident(
	id: number,
	payload: UpdateIncidentFormValues,
): Promise<Incident> {
	const response = await api.patch<Incident>(`/incidents/${id}/`, payload);

	return response.data;
}

export async function updateIncidentStatus(
	id: number,
	status: IncidentStatus,
): Promise<Incident> {
	const response = await api.patch<Incident>(`/incidents/${id}/`, { status });

	return response.data;
}

export async function exportIncidents(
	params: ExportIncidentParams,
): Promise<Blob> {
	const response = await api.post("/reports/export/", params, {
		responseType: "blob",
	});

	return response.data;
}

export async function getIncidentComments(
	incidentId: number,
): Promise<IncidentComment[]> {
	const response = await api.get<IncidentComment[]>(
		`/incidents/${incidentId}/comments/`,
	);

	return response.data;
}

export async function createIncidentComment(
	incidentId: number,
	body: string,
): Promise<IncidentComment> {
	const response = await api.post<IncidentComment>(
		`/incidents/${incidentId}/comments/`,
		{ body },
	);

	return response.data;
}

export async function deleteIncidentComment(commentId: number): Promise<void> {
	await api.delete(`/comments/${commentId}/`);
}
