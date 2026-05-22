import type { PropsWithChildren } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/features/auth/auth.store.tsx";
import { describe, expect, it } from "vitest";
import { userEvent } from "@testing-library/user-event/dist/cjs/setup/index.js";
import { render, screen } from "@testing-library/react";
import { LoginPage } from "@/features/auth/LoginPage.tsx";

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
			<BrowserRouter>
				<AuthProvider>{children}</AuthProvider>
			</BrowserRouter>
		</QueryClientProvider>
	);
}

describe("LoginPage", () => {
	it("shows validation errors when submitting empty form", async () => {
		const user = userEvent.setup();

		render(
			<TestProviders>
				<LoginPage />
			</TestProviders>,
		);

		await user.click(
			screen.getByRole("button", {
				name: /sign in/i,
			}),
		);

		expect(await screen.findByText("Username is required")).toBeInTheDocument();

		expect(await screen.findByText("Password is required")).toBeInTheDocument();
	});
});
