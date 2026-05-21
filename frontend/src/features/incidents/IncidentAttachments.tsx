import { useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	deleteIncidentAttachment,
	getIncidentAttachments,
	uploadIncidentAttachment,
} from "@/features/incidents/incident.api.ts";
import * as React from "react";
import { Button } from "@/components/ui/button.tsx";

const API_ORIGIN = import.meta.env.VITE_API_BASE_URL.replace("/api", "");

type Props = {
	incidentId: number;
};

function formatFileSize(size: number) {
	if (size < 1024) return `${size} B`;
	if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;

	return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

function getFileUrl(filePath: string) {
	if (filePath.startsWith("http")) return filePath;

	return `${API_ORIGIN}${filePath}`;
}

export function IncidentAttachments({ incidentId }: Props) {
	const inputRef = useRef<HTMLInputElement | null>(null);
	const queryClient = useQueryClient();

	const attachmentsQuery = useQuery({
		queryKey: ["incidents", incidentId, "attachments"],
		queryFn: () => getIncidentAttachments(incidentId),
	});

	const uploadMutation = useMutation({
		mutationFn: (file: File) => uploadIncidentAttachment(incidentId, file),
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: ["incidents", incidentId, "attachments"],
			});

			await queryClient.invalidateQueries({
				queryKey: ["incidents", incidentId, "activity-logs"],
			});

			if (inputRef.current) {
				inputRef.current.value = "";
			}
		},
	});

	const deleteMutation = useMutation({
		mutationFn: deleteIncidentAttachment,
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: ["incidents", incidentId, "attachments"],
			});

			await queryClient.invalidateQueries({
				queryKey: ["incidents", incidentId, "activity-logs"],
			});
		},
	});

	function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
		const file = event.target.files?.[0];

		if (!file) return;

		uploadMutation.mutate(file);
	}

	return (
		<div className="rounded-lg border bg-background p-6">
			<div className="flex items-center justify-between gap-4">
				<div>
					<h2 className="text-lg font-semibold">Attachments</h2>
					<p className="text-sm text-muted-foreground">
						Upload related files for this incident.
					</p>
				</div>
				<div>
					<input
						ref={inputRef}
						type="file"
						className="hidden"
						onChange={handleFileChange}
					/>
					<Button
						type="button"
						disabled={uploadMutation.isPending}
						onClick={() => inputRef.current?.click()}
					>
						{uploadMutation.isPending ? "Uploading..." : "Upload File"}
					</Button>
				</div>
			</div>
			{uploadMutation.isError && (
				<p className="mt-3 text-sm text-destructive">
					Failed to upload file. Please try again.
				</p>
			)}
			{attachmentsQuery.isLoading && (
				<p className="mt-4 text-sm text-muted-foreground">
					Loading attachments...
				</p>
			)}
			{attachmentsQuery.data && (
				<div className="mt-6 space-y-3">
					{attachmentsQuery.data.length === 0 ? (
						<p className="text-sm text-muted-foreground">
							No attachments uploaded yet.
						</p>
					) : (
						attachmentsQuery.data.map((attachment) => (
							<div
								key={attachment.id}
								className="flex items-center justify-between rounded-md border p-3"
							>
								<div>
									<a
										href={getFileUrl(attachment.file)}
										target="_blank"
										rel="noreferrer"
										className="font-medium hover:underline"
									>
										{attachment.original_name}
									</a>
									<p className="text-xs text-muted-foreground">
										{formatFileSize(attachment.size)} · uploaded by{" "}
										{attachment.uploaded_by?.username ?? "Unknown"} ·{" "}
										{new Date(attachment.uploaded_at).toLocaleString()}
									</p>
								</div>
								<Button
									size="sm"
									variant="destructive"
									disabled={deleteMutation.isPending}
									onClick={() => deleteMutation.mutate(attachment.id)}
								>
									Delete
								</Button>
							</div>
						))
					)}
				</div>
			)}
		</div>
	);
}
