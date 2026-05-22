import { beforeEach, describe, vi, it, expect } from "vitest";
import type { PropsWithChildren } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";

import * as incidentApi from "./incident.api";
import { render, screen } from "@testing-library/react";
import { IncidentListPage } from "@/features/incidents/IncidentListPage.tsx";

vi.mock("./incident.api");

function TestProviders({ children }: PropsWithChildren) {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				retry: false,
			},
		},
	});

	return (
		<QueryClientProvider client={queryClient}>
			<BrowserRouter>{children}</BrowserRouter>
		</QueryClientProvider>
	);
}

describe("IncidentListPage", () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	it("renders incidents from API", async () => {
		vi.mocked(incidentApi.getIncidents).mockResolvedValue({
			count: 1,
			next: null,
			previous: null,
			results: [
				{
					id: 1,
					title: "Cannot export report",
					description: "Export fails",
					status: "new",
					priority: "high",
					is_archived: false,
					created_at: "2026-05-22T10:00:00+07:00",
					updated_at: "2026-05-22T10:00:00+07:00",
					created_by: {
						id: 1,
						username: "admin",
						email: "admin@example.com",
						first_name: "",
						last_name: "",
						role: "admin",
					},
					assigned_to: null,
				},
			],
		});

		render(
			<TestProviders>
				<IncidentListPage />
			</TestProviders>,
		);

		expect(await screen.findByText("Cannot export report")).toBeInTheDocument();

		expect(screen.getByText("admin")).toBeInTheDocument();
		expect(screen.getByText("high")).toBeInTheDocument();
	});
});
