import type { PropsWithChildren } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client.ts";
import { AuthProvider } from "@/features/auth/auth.store.tsx";
import { AuthBootstrap } from "@/features/auth/AuthBootstrap.tsx";
import { Toaster } from "@/components/ui/sonner.tsx";
import { ThemeProvider } from "@/features/theme/theme.store.tsx";

export function AppProviders({ children }: PropsWithChildren) {
	return (
		<QueryClientProvider client={queryClient}>
			<ThemeProvider>
				<AuthProvider>
					<AuthBootstrap>
						{children}
						<Toaster richColors />
					</AuthBootstrap>
				</AuthProvider>
			</ThemeProvider>
		</QueryClientProvider>
	);
}
