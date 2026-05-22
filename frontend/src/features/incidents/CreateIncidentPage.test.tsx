import type { PropsWithChildren } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { describe, it, expect } from "vitest";
import { userEvent } from "@testing-library/user-event/dist/cjs/setup/index.js";
import { render, screen } from "@testing-library/react";
import { CreateIncidentPage } from "@/features/incidents/CreateIncidentPage.tsx";

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

describe("CreateIncidentPage", () => {
	it("shows validation errors when submitting empty form", async () => {
		const user = userEvent.setup();

		render(
			<TestProviders>
				<CreateIncidentPage />
			</TestProviders>,
		);

		await user.click(
			screen.getByRole("button", {
				name: /create incident/i,
			}),
		);

		expect(
			await screen.findByText("Description must be at least 10 characters"),
		).toBeInTheDocument();
	});
});
