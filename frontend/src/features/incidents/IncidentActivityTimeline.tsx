import { useQuery } from "@tanstack/react-query";
import { getIncidentActivityLogs } from "@/features/incidents/incident.api.ts";

type Props = {
	incidentId: number;
};

function renderMessage(log: {
	action: string;
	field_name: string | null;
	old_value: string | null;
	new_value: string | null;
}) {
	switch (log.action) {
		case "created":
			return "Created incident";
		case "status_changed":
			return `Status changed: ${log.old_value} → ${log.new_value}`;
		case "priority_changed":
			return `Priority changed: ${log.old_value} → ${log.new_value}`;
		case "assigned":
			return `Assigned to ${log.new_value}`;
		case "archived":
			return "Archived incident";
		default:
			return log.action;
	}
}

export function IncidentActivityTimeline({ incidentId }: Props) {
	const logsQuery = useQuery({
		queryKey: ["incidents", incidentId, "activity-logs"],
		queryFn: () => getIncidentActivityLogs(incidentId),
	});

	return (
		<div className="rounded-lg border bg-background p-6">
			<h2 className="text-lg font-semibold">Activity Timeline</h2>
			{logsQuery.isLoading && (
				<p className="mt-4 text-sm text-muted-foreground">
					Loading activity...
				</p>
			)}
			{logsQuery.data && (
				<div className="mt-6 space-y-4">
					{logsQuery.data.length === 0 ? (
						<p className="text-sm text-muted-foreground">No activity yet.</p>
					) : (
						logsQuery.data.map((log) => (
							<div key={log.id} className="border-l-2 pl-4">
								<p className="font-medium">{renderMessage(log)}</p>
								<p className="text-sm text-muted-foreground">
									{log.user?.username ?? "System"}
								</p>
								<p className="text-xs text-muted-foreground">
									{new Date(log.created_at).toLocaleString()}
								</p>
							</div>
						))
					)}
				</div>
			)}
		</div>
	);
}
