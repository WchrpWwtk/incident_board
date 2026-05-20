import { useAuth } from "@/features/auth/auth.store.tsx";

export function DashboardPage() {
	const { user } = useAuth();

	return (
		<main className="min-h-screen bg-muted/40 p-6">
			<div className="mx-auto max-w-6xl">
				<h1 className="text-2xl font-semibold">Dashboard</h1>
				<p className="mt-2 text-muted-foreground">Welcome, {user?.username}</p>
			</div>
		</main>
	);
}
