import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import {
	type CreateIncidentFormValues,
	createIncidentSchema,
} from "@/features/incidents/incident.schema.ts";
import { zodResolver } from "@hookform/resolvers/zod";
import { createIncident } from "@/features/incidents/incident.api.ts";
import { Button } from "@/components/ui/button.tsx";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/ui/card.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select.tsx";

export function CreateIncidentPage() {
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	const form = useForm<CreateIncidentFormValues>({
		resolver: zodResolver(createIncidentSchema),
		defaultValues: {
			title: "",
			description: "",
			priority: "medium",
		},
	});

	const createMutation = useMutation({
		mutationFn: createIncident,
		onSuccess: async (incident) => {
			await queryClient.invalidateQueries({
				queryKey: ["incidents"],
			});

			navigate(`/incidents/${incident.id}`);
		},
	});

	function onSubmit(values: CreateIncidentFormValues) {
		createMutation.mutate(values);
	}

	return (
		<div className="mx-auto max-w-2xl space-y-6">
			<div>
				<Button asChild variant="outline">
					<Link to="/incidents">Back</Link>
				</Button>
			</div>
			<Card>
				<CardHeader>
					<CardTitle>Create Incident</CardTitle>
				</CardHeader>
				<CardContent>
					<form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
						<div className="space-y-2">
							<Label htmlFor="title">Title</Label>
							<Input id="title" {...form.register("title")} />
							{form.formState.errors.title && (
								<p className="text-sm text-destructive">
									{form.formState.errors.title.message}
								</p>
							)}
						</div>
						<div className="space-y-2">
							<Label htmlFor="description">Description</Label>
							<Textarea
								id="description"
								rows={6}
								{...form.register("description")}
							/>
							{form.formState.errors.description && (
								<p className="text-sm text-destructive">
									{form.formState.errors.description.message}
								</p>
							)}
						</div>
						<div className="space-y-2">
							<Label>Priority</Label>
							<Select
								value={form.watch("priority")}
								onValueChange={(value) =>
									form.setValue(
										"priority",
										value as CreateIncidentFormValues["priority"],
										{ shouldValidate: true },
									)
								}
							>
								<SelectTrigger>
									<SelectValue placeholder="Select priority" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="low">Low</SelectItem>
									<SelectItem value="medium">Medium</SelectItem>
									<SelectItem value="high">High</SelectItem>
									<SelectItem value="critical">Critical</SelectItem>
								</SelectContent>
							</Select>
						</div>
						{createMutation.isError && (
							<p className="text-sm text-destructive">
								Failed to create incident. Please try again.
							</p>
						)}
						<Button
							type="submit"
							disabled={createMutation.isPending}
							className="w-full"
						>
							{createMutation.isPending ? "Creating..." : "Create Incident"}
						</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
