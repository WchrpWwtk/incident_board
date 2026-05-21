export type DashboardSummary = {
	total_incidents: number;
	total_open_incidents: number;
	total_closed_incidents: number;
	total_critical_incidents: number;
	incidents_by_status: Record<string, number>;
	incidents_by_priority: Record<string, number>;
};
