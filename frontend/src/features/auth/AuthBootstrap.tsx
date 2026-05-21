import { type PropsWithChildren, useEffect } from "react";
import { useAuth } from "@/features/auth/auth.store.tsx";
import { useQuery } from "@tanstack/react-query";
import { getProfile } from "@/features/auth/auth.api.ts";

export function AuthBootstrap({ children }: PropsWithChildren) {
	const { user, setUser } = useAuth();

	const profileQuery = useQuery({
		queryKey: ["auth", "profile"],
		queryFn: getProfile,
		retry: false,
	});

	useEffect(() => {
		if (profileQuery.data) {
			setUser(profileQuery.data);
		}

		if (profileQuery.isError) {
			setUser(null);
		}
	}, [profileQuery.data, profileQuery.isError, setUser]);

	if (profileQuery.isLoading || profileQuery.isFetching) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<p className="text-sm text-muted-foreground">Loading session...</p>
			</div>
		);
	}

	if (profileQuery.data && !user) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<p className="text-sm text-muted-foreground">Restoring session...</p>
			</div>
		);
	}

	return children;
}
