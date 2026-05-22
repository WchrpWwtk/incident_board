import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
	createIncidentComment,
	deleteIncidentComment,
	getIncidentComments,
} from "@/features/incidents/incident.api.ts";
import { Textarea } from "@/components/ui/textarea.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog.tsx";

type Props = {
	incidentId: number;
};

export function IncidentComments({ incidentId }: Props) {
	const queryClient = useQueryClient();

	const [comment, setComment] = useState("");

	const commentsQuery = useQuery({
		queryKey: ["incidents", incidentId, "comments"],
		queryFn: () => getIncidentComments(incidentId),
	});

	const createMutation = useMutation({
		mutationFn: (body: string) => createIncidentComment(incidentId, body),
		onSuccess: async () => {
			setComment("");

			await queryClient.invalidateQueries({
				queryKey: ["incidents", incidentId, "comments"],
			});
		},
	});

	const deleteMutation = useMutation({
		mutationFn: deleteIncidentComment,
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: ["incidents", incidentId, "comments"],
			});
		},
	});

	return (
		<div className="mt-6 rounded-lg border bg-background p-6">
			<h2 className="text-lg font-semibold">Comments</h2>
			<div className="mt-4 space-y-3">
				<Textarea
					placeholder="Write a comment..."
					value={comment}
					onChange={(event) => setComment(event.target.value)}
				/>
				<Button
					disabled={createMutation.isPending || comment.trim().length === 0}
					onClick={() => createMutation.mutate(comment.trim())}
				>
					Add Comment
				</Button>
			</div>
			{commentsQuery.isLoading && (
				<p className="mt-4 text-sm text-muted-foreground">
					Loading comments...
				</p>
			)}
			{commentsQuery.data && (
				<div className="mt-6 space-y-4">
					{commentsQuery.data.length === 0 ? (
						<p className="text-sm text-muted-foreground">No comments yet.</p>
					) : (
						commentsQuery.data.map((comment) => (
							<div key={comment.id} className="rounded-md border p-4">
								<div className="flex items-center justify-between">
									<div>
										<p className="font-medium">{comment.user.username}</p>
										<p className="text-xs text-muted-foreground">
											{new Date(comment.created_at).toLocaleString()}
										</p>
									</div>
									<AlertDialog>
										<AlertDialogTrigger asChild>
											<Button
												size="sm"
												variant="destructive"
												disabled={deleteMutation.isPending}
											>
												Delete
											</Button>
										</AlertDialogTrigger>
										<AlertDialogContent>
											<AlertDialogHeader>
												<AlertDialogTitle>Delete comment?</AlertDialogTitle>
												<AlertDialogDescription>
													This comment will be permanently deleted. This action
													cannot be undone.
												</AlertDialogDescription>
											</AlertDialogHeader>
											<AlertDialogFooter>
												<AlertDialogCancel>Cancel</AlertDialogCancel>
												<AlertDialogAction
													onClick={() => deleteMutation.mutate(comment.id)}
												>
													Delete
												</AlertDialogAction>
											</AlertDialogFooter>
										</AlertDialogContent>
									</AlertDialog>
								</div>
								<p className="mt-3 whitespace-pre-wrap text-sm">
									{comment.body}
								</p>
							</div>
						))
					)}
				</div>
			)}
		</div>
	);
}
