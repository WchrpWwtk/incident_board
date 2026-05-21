import { useAuth } from "@/features/auth/auth.store.tsx";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { logout } from "@/features/auth/auth.api.ts";
import { Button } from "@/components/ui/button.tsx";

export function AppLayout() {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { user, setUser } = useAuth();

	const logoutMutation = useMutation({
		mutationFn: logout,
		onSuccess: async () => {
			setUser(null);
			queryClient.clear();
			navigate("/login");
		},
	});

	return (
		<div className="min-h-screen bg-muted/40">
			<aside className="fixed inset-y-0 left-0 w-64 border-r bg-background p-4">
				<h1 className="text-lg font-semibold">IncidentBoard</h1>
				<nav className="mt-6 space-y-2">
					<NavLink
						className="block rounded-md px-3 py-2 hover:bg-muted"
						to="/dashboard"
					>
						Dashboard
					</NavLink>
					<NavLink
						className="block rounded-md px-3 py-2 hover:bg-muted"
						to="/incidents"
					>
						Incidents
					</NavLink>
				</nav>
			</aside>
			<div className="pl-64">
				<header className="flex h-14 items-center justify-between border-b bg-background px-6">
					<span className="text-sm text-muted-foreground">
						Signed in as {user?.username} ({user?.role})
					</span>
					<Button
						variant="outline"
						size="sm"
						disabled={logoutMutation.isPending}
						onClick={() => logoutMutation.mutate()}
					>
						Logout
					</Button>
				</header>
				<main className="p-6">
					<Outlet />
				</main>
			</div>
		</div>
	);
}
