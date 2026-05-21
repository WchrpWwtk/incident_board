import type {
	Incident,
	IncidentStatus,
} from "@/features/incidents/incident.types.ts";

type WorkflowAction = {
	label: string;
	nextStatus: IncidentStatus;
};

export function getWorkflowActions(incident: Incident): WorkflowAction[] {
	switch (incident.status) {
		case "new":
			return [
				{
					label: "Start Progress",
					nextStatus: "in_progress",
				},
			];
		case "in_progress":
			return [
				{
					label: "Send To Manager Review",
					nextStatus: "pending_manager_review",
				},
			];
		case "pending_manager_review":
			return [
				{
					label: "Resolved Incident",
					nextStatus: "resolved",
				},
				{
					label: "Return To Reporter",
					nextStatus: "returned_to_reporter",
				},
			];
		case "resolved":
			return [
				{
					label: "Close Incident",
					nextStatus: "closed",
				},
			];
		default:
			return [];
	}
}
