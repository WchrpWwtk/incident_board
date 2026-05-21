import { z } from "zod";

export const createIncidentSchema = z.object({
	title: z.string().min(3, "Title must be at least 3 characters"),
	description: z.string().min(10, "Description must be at least 10 characters"),
	priority: z.enum(["low", "medium", "high", "critical"]),
});

export type CreateIncidentFormValues = z.infer<typeof createIncidentSchema>;
