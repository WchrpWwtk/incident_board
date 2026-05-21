import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getIncident } from "@/features/incidents/incident.api.ts";
import { Button } from "@/components/ui/button.tsx";
import { Badge } from "@/components/ui/badge.tsx";

export function IncidentDetailPage() {
	const { id } = useParams<{ id: string }>();

	const incidentQuery = useQuery({
		queryKey: ["incidents", id],
		queryFn: () => getIncident(id!),
		enabled: Boolean(id),
	});

	if (incidentQuery.isLoading) {
		return <p className="text-sm text-muted-foreground">Loading incident...</p>;
	}

	if (incidentQuery.isError || !incidentQuery.data) {
		return (
			<div className="space-y-4">
				<p className="text-sm text-destructive">Failed to load incident.</p>
				<Button asChild variant="outline">
					<Link to="/incidents">Back to incidents</Link>
				</Button>
			</div>
		);
	}

	const incident = incidentQuery.data;

	return (
		<div className="space-y-6">
			<div>
				<Button asChild variant="outline">
					<Link to="/incidents">Back</Link>
				</Button>
				<Button asChild>
					<Link to={`/incidents/${incident.id}/edit`}>Edit</Link>
				</Button>
			</div>
			<div className="rounded-lg border bg-background p-6">
				<div className="flex items-start justify-between gap-4">
					<div>
						<h1 className="text-2xl font-semibold">{incident.title}</h1>
						<p className="mt-2 text-sm text-muted-foreground">
							Created by {incident.created_by.username}
						</p>
					</div>
					<div className="flex gap-2">
						<Badge variant="outline">
							{incident.status.replaceAll("_", " ")}
						</Badge>
						<Badge
							variant={
								incident.priority === "critical" ? "destructive" : "secondary"
							}
						>
							{incident.priority}
						</Badge>
					</div>
				</div>
				<div className="mt-6">
					<h2 className="text-sm font-medium">Description</h2>
					<p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
						{incident.description}
					</p>
				</div>
				<div className="mt-6 grid gap-4 text-sm md:grid-cols-2">
					<div>
						<p className="text-muted-foreground">Assigned To</p>
						<p>{incident.assigned_to?.username ?? "Unassigned"}</p>
					</div>
					<div>
						<p className="text-muted-foreground">Created At</p>
						<p>{new Date(incident.created_at).toLocaleString()}</p>
					</div>
					<div>
						<p className="text-muted-foreground">Updated At</p>
						<p>{new Date(incident.updated_at).toLocaleString()}</p>
					</div>
				</div>
			</div>
		</div>
	);
}
