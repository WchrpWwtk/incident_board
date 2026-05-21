import type {
	Incident,
	PaginatedResponse,
} from "@/features/incidents/incident.types.ts";
import { api } from "@/lib/api.ts";

export async function getIncidents(): Promise<PaginatedResponse<Incident>> {
	const response = await api.get<PaginatedResponse<Incident>>("/incidents/");

	return response.data;
}

export async function getIncident(id: string): Promise<Incident> {
	const response = await api.get<Incident>(`/incidents/${id}/`);

	return response.data;
}
