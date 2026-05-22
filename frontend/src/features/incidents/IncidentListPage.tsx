import { useMutation, useQuery } from "@tanstack/react-query";
import {
	exportIncidents,
	getIncidents,
} from "@/features/incidents/incident.api.ts";
import { Button } from "@/components/ui/button.tsx";
import { Link } from "react-router-dom";
import type {
	IncidentPriority,
	IncidentStatus,
} from "@/features/incidents/incident.types.ts";
import { Badge } from "@/components/ui/badge.tsx";
import { useState } from "react";
import { Input } from "@/components/ui/input.tsx";

function formatStatus(status: IncidentStatus) {
	return status.replaceAll("_", " ");
}

function getPriorityVariant(priority: IncidentPriority) {
	if (priority === "critical") return "destructive";

	return "secondary";
}

export function IncidentListPage() {
	const [search, setSearch] = useState("");
	const [statusFilter, setStatusFilter] = useState("");
	const [priorityFilter, setPriorityFilter] = useState("");

	const pageSize = 10;
	const [page, setPage] = useState(1);

	const offset = (page - 1) * pageSize;

	const incidentsQuery = useQuery({
		queryKey: ["incidents", search, statusFilter, priorityFilter, page],
		queryFn: () =>
			getIncidents({
				search: search || undefined,
				status: statusFilter || undefined,
				priority: priorityFilter || undefined,
				limit: pageSize,
				offset,
			}),
	});

	const exportMutation = useMutation({
		mutationFn: () =>
			exportIncidents({
				status: statusFilter || undefined,
				priority: priorityFilter || undefined,
			}),
		onSuccess: (blob) => {
			const url = window.URL.createObjectURL(blob);
			const link = document.createElement("a");

			link.href = url;
			link.download = "incident-report.csv";
			link.click();

			window.URL.revokeObjectURL(url);
		},
	});

	function handleSearchChange(value: string) {
		setSearch(value);
		setPage(1);
	}

	function handleStatusChange(value: string) {
		setStatusFilter(value);
		setPage(1);
	}

	function handlePriorityChange(value: string) {
		setPriorityFilter(value);
		setPage(1);
	}

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
	const totalCount = incidentsQuery.data?.count ?? 0;

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-semibold">Incidents</h1>
					<p className="text-sm text-muted-foreground">
						Manage and track operational incidents.
					</p>
				</div>
				<div className="flex gap-2">
					<Button asChild>
						<Link to="/incidents/new">Create Incident</Link>
					</Button>
					<Button
						type="button"
						variant="outline"
						disabled={exportMutation.isPending}
						onClick={() => exportMutation.mutate()}
					>
						{exportMutation.isPending ? "Exporting..." : "Export CSV"}
					</Button>
				</div>
			</div>
			<div className="grid gap-4 md:grid-cols-3">
				<Input
					className="h-10 rounded-md border bg-background px-3 text-sm"
					placeholder="Search incidents..."
					value={search}
					onChange={(event) => handleSearchChange(event.target.value)}
				/>
				<select
					className="h-10 rounded-md border bg-background px-3 text-sm"
					value={statusFilter}
					onChange={(event) => handleStatusChange(event.target.value)}
				>
					<option value="">All Statuses</option>
					<option value="new">New</option>
					<option value="in_progress">In Progress</option>
					<option value="pending_manager_review">Pending Manager Review</option>
					<option value="resolved">Resolved</option>
					<option value="closed">Closed</option>
					<option value="cancelled">Cancelled</option>
				</select>
				<select
					className="h-10 rounded-md border bg-background px-3 text-sm"
					value={priorityFilter}
					onChange={(event) => handlePriorityChange(event.target.value)}
				>
					<option value="">All Priorities</option>
					<option value="low">Low</option>
					<option value="medium">Medium</option>
					<option value="high">High</option>
					<option value="critical">Critical</option>
				</select>
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
			{totalCount > 0 && (
				<div className="flex items-center justify-between">
					<p className="text-sm text-muted-foreground">
						Showing {offset + 1}-{Math.min(offset + pageSize, totalCount)} of{" "}
						{totalCount}
					</p>
					<div className="flex gap-2">
						<Button
							type="button"
							variant="outline"
							disabled={page === 1}
							onClick={() => setPage((current) => current - 1)}
						>
							Previous
						</Button>
						<Button
							type="button"
							variant="outline"
							disabled={!incidentsQuery.data?.next}
							onClick={() => setPage((current) => current + 1)}
						>
							Next
						</Button>
					</div>
				</div>
			)}
		</div>
	);
}
