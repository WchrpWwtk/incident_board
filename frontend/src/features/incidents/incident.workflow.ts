import type {
	Incident,
	IncidentStatus,
} from "@/features/incidents/incident.types.ts";
import type { User } from "@/features/auth/auth.types.ts";

type WorkflowAction = {
	label: string;
	nextStatus: IncidentStatus;
};

function canUseRole(user: User | null, allowedRoles: User["role"][]) {
	if (!user) return false;

	return allowedRoles.includes(user.role);
}

export function getWorkflowActions(
	incident: Incident,
	user: User | null,
): WorkflowAction[] {
	switch (incident.status) {
		case "new":
			if (!canUseRole(user, ["processor", "admin"])) return [];

			return [
				{
					label: "Start Progress",
					nextStatus: "in_progress",
				},
			];
		case "in_progress":
			if (!canUseRole(user, ["processor", "admin"])) return [];

			return [
				{
					label: "Send To Manager Review",
					nextStatus: "pending_manager_review",
				},
			];
		case "pending_manager_review":
			if (!canUseRole(user, ["manager", "admin"])) return [];

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
			if (!canUseRole(user, ["manager", "admin"])) return [];

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
