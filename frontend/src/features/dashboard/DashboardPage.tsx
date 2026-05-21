import { useQuery } from "@tanstack/react-query";
import { getDashboardSummary } from "@/features/dashboard/dashboard.api.ts";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/ui/card.tsx";

export function DashboardPage() {
	const dashboardQuery = useQuery({
		queryKey: ["dashboard"],
		queryFn: getDashboardSummary,
	});

	if (dashboardQuery.isLoading) {
		return (
			<p className="text-sm text-muted-foreground">Loading dashboard...</p>
		);
	}

	if (dashboardQuery.isError || !dashboardQuery.data) {
		return (
			<p className="text-sm text-destructive">Failed to load dashboard.</p>
		);
	}

	const data = dashboardQuery.data;

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-semibold">Dashboard</h1>
				<p className="text-sm text-muted-foreground">
					Operational overview of incidents.
				</p>
			</div>
			<div className="grid gap-4 md:grid-cols-4">
				<Card>
					<CardHeader>
						<CardTitle>Total</CardTitle>
					</CardHeader>
					<CardContent className="text-3xl font-semibold">
						{data.total_incidents}
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle>Open</CardTitle>
					</CardHeader>
					<CardContent className="text-3xl font-semibold">
						{data.total_open_incidents}
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle>Closed</CardTitle>
					</CardHeader>
					<CardContent className="text-3xl font-semibold">
						{data.total_closed_incidents}
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle>Critical</CardTitle>
					</CardHeader>
					<CardContent className="text-3xl font-semibold">
						{data.total_critical_incidents}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
