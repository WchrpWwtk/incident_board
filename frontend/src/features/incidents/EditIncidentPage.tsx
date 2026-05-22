import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	getIncident,
	updateIncident,
} from "@/features/incidents/incident.api.ts";
import {
	type UpdateIncidentFormValues,
	updateIncidentSchema,
} from "@/features/incidents/incident.schema.ts";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
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
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/error.ts";

export function EditIncidentPage() {
	const { id } = useParams<{ id: string }>();
	const incidentId = Number(id);

	const navigate = useNavigate();
	const queryClient = useQueryClient();

	const incidentQuery = useQuery({
		queryKey: ["incidents", id],
		queryFn: () => getIncident(id!),
		enabled: Boolean(id),
	});

	const form = useForm<UpdateIncidentFormValues>({
		resolver: zodResolver(updateIncidentSchema),
		defaultValues: {
			title: "",
			description: "",
			priority: "medium",
		},
	});

	useEffect(() => {
		if (incidentQuery.data) {
			form.reset({
				title: incidentQuery.data.title,
				description: incidentQuery.data.description,
				priority: incidentQuery.data.priority,
			});
		}
	}, [incidentQuery.data, form]);

	const updateMutation = useMutation({
		mutationFn: (values: UpdateIncidentFormValues) =>
			updateIncident(incidentId, values),
		onSuccess: async (incident) => {
			toast.success("Incident updated successfully");

			await queryClient.invalidateQueries({
				queryKey: ["incidents"],
			});

			await queryClient.invalidateQueries({
				queryKey: ["incidents", id],
			});

			navigate(`/incidents/${incident.id}`);
		},
		onError: (error) => {
			toast.error(getApiErrorMessage(error));
		},
	});

	function onSubmit(values: UpdateIncidentFormValues) {
		updateMutation.mutate(values);
	}

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

	return (
		<div className="mx-auto max-w-2xl space-y-6">
			<div>
				<Button asChild variant="outline">
					<Link to={`/incidents/${incidentId}`}>Back</Link>
				</Button>
			</div>
			<Card>
				<CardHeader>
					<CardTitle>Edit Incident</CardTitle>
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
										value as UpdateIncidentFormValues["priority"],
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
						{updateMutation.isError && (
							<p className="text-sm text-destructive">
								Failed to update incident. Please try again.
							</p>
						)}
						<Button
							type="submit"
							disabled={updateMutation.isPending}
							className="w-full"
						>
							{updateMutation.isPending ? "Saving..." : "Save Changes"}
						</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
