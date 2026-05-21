import type { DashboardSummary } from "@/features/dashboard/dashboard.types.ts";
import { api } from "@/lib/api.ts";

export async function getDashboardSummary(): Promise<DashboardSummary> {
	const response = await api.get<DashboardSummary>("/dashboard/");

	return response.data;
}
