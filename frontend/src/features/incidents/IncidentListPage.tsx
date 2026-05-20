import { useQuery } from "@tanstack/react-query";
import { getIncidents } from "@/features/incidents/incident.api.ts";
import { Button } from "@/components/ui/button.tsx";
import { Link } from "react-router-dom";
import type {
	IncidentPriority,
	IncidentStatus,
} from "@/features/incidents/incident.types.ts";
import { Badge } from "@/components/ui/badge.tsx";

function formatStatus(status: IncidentStatus) {
	return status.replaceAll("_", " ");
}

function getPriorityVariant(priority: IncidentPriority) {
	if (priority === "critical") return "destructive";

	return "secondary";
}

export function IncidentListPage() {
	const incidentsQuery = useQuery({
		queryKey: ["incidents"],
		queryFn: getIncidents,
	});

	if (incidentsQuery.isLoading) {
		return (
			<p className="text-sm text-muted-foreground">Loading incidents...</p>
		);
	}

	if (incidentsQuery.isError) {
		return (
			<div className="rounded-md border border-destructive/30 bg-destructive/10 p-4">
				<p className="text-sm text-destructive">
					Failed to load incidents. Please try again.
				</p>
			</div>
		);
	}

	const incidents = incidentsQuery.data?.results ?? [];

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-semibold">Incidents</h1>
					<p className="text-sm text-muted-foreground">
						Manage and track operational incidents.
					</p>
				</div>
				<Button asChild>
					<Link to="/incidents/new">Create Incident</Link>
				</Button>
			</div>
			{incidents.length === 0 ? (
				<div className="rounded-lg border bg-background p-8 text-center">
					<p className="text-sm text-muted-foreground">No incidents found.</p>
				</div>
			) : (
				<div className="overflow-hidden rounded-lg border bg-background">
					<table className="w-full text-sm">
						<thead className="border-b bg-muted/50 text-left">
							<tr>
								<th className="px-4 py-3">Title</th>
								<th className="px-4 py-3">Status</th>
								<th className="px-4 py-3">Priority</th>
								<th className="px-4 py-3">Created By</th>
								<th className="px-4 py-3">Created At</th>
							</tr>
						</thead>
						<tbody>
							{incidents.map((incident) => (
								<tr key={incident.id} className="border-b last:border-0">
									<td className="px-4 py-3 font-medium">
										<Link
											className="hover:underline"
											to={`/incidents/${incident.id}`}
										>
											{incident.title}
										</Link>
									</td>
									<td className="px-4 py-3">
										<Badge variant="outline">
											{formatStatus(incident.status)}
										</Badge>
									</td>
									<td className="px-4 py-3">
										<Badge variant={getPriorityVariant(incident.priority)}>
											{incident.priority}
										</Badge>
									</td>
									<td className="px-4 py-3">{incident.created_by.username}</td>
									<td className="px-4 py-3">
										{new Date(incident.created_at).toLocaleString()}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
}
