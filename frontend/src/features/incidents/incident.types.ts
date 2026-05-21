import type { User } from "@/features/auth/auth.types.ts";

export type IncidentStatus =
	| "new"
	| "in_progress"
	| "pending_manager_review"
	| "returned_to_reporter"
	| "resolved"
	| "cancelled"
	| "closed";

export type IncidentPriority = "low" | "medium" | "high" | "critical";

export type Incident = {
	id: number;
	title: string;
	description: string;
	status: IncidentStatus;
	priority: IncidentPriority;
	created_by: User;
	assigned_to: User | null;
	is_archived: boolean;
	created_at: string;
	updated_at: string;
};

export type PaginatedResponse<T> = {
	count: number;
	next: string | null;
	previous: string | null;
	results: T[];
};

export type IncidentComment = {
	id: number;
	incident: number;
	user: User;
	body: string;
	created_at: string;
	updated_at: string;
};
