import {
	Bar,
	BarChart,
	CartesianGrid,
	Pie,
	PieChart,
	Rectangle,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

type Props = {
	statusData: Record<string, number>;
	priorityData: Record<string, number>;
};

const STATUS_COLORS: Record<string, string> = {
	new: "#3b82f6",
	in_progress: "#22c55e",
	pending_manager_review: "#f59e0b",
	returned_to_reporter: "#ef4444",
	resolved: "#8b5cf6",
	closed: "#06b6d4",
	cancelled: "#6b7280",
};

const PRIORITY_COLORS: Record<string, string> = {
	low: "#22c55e",
	medium: "#3b82f6",
	high: "#f59e0b",
	critical: "#ef4444",
};

export function DashboardCharts({ statusData, priorityData }: Props) {
	const statusChartData = Object.entries(statusData).map(([name, value]) => ({
		name: name.replaceAll("_", " "),
		value,
		fill: STATUS_COLORS[name] ?? "#94a3b8",
	}));

	const priorityChartData = Object.entries(priorityData).map(
		([name, value]) => ({
			name,
			value,
			fill: PRIORITY_COLORS[name] ?? "#94a3b8",
		}),
	);

	return (
		<div className="grid gap-4 md:grid-cols-2">
			<div className="rounded-lg border bg-background p-4">
				<h2 className="mb-4 text-lg font-semibold">Status Distribution</h2>
				<ResponsiveContainer width="100%" height={300}>
					<PieChart>
						<Pie data={statusChartData} dataKey="value" nameKey="name" />
						<Tooltip />
					</PieChart>
				</ResponsiveContainer>
			</div>
			<div className="rounded-lg border bg-background p-4">
				<h2 className="mb-4 text-lg font-semibold">Priority Distribution</h2>
				<ResponsiveContainer width="100%" height={300}>
					<BarChart data={priorityChartData}>
						<CartesianGrid strokeDasharray="3 3" />
						<XAxis dataKey="name" />
						<YAxis allowDecimals={false} />
						<Tooltip />
						<Bar
							dataKey="value"
							shape={(props) => (
								<Rectangle {...props} fill={props.payload.fill} />
							)}
						/>
					</BarChart>
				</ResponsiveContainer>
			</div>
		</div>
	);
}
