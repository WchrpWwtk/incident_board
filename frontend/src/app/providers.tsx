import type { PropsWithChildren } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client.ts";
import { AuthProvider } from "@/features/auth/auth.store.tsx";
import { AuthBootstrap } from "@/features/auth/AuthBootstrap.tsx";

export function AppProviders({ children }: PropsWithChildren) {
	return (
		<QueryClientProvider client={queryClient}>
			<AuthProvider>
				<AuthBootstrap>{children}</AuthBootstrap>
			</AuthProvider>
		</QueryClientProvider>
	);
}
