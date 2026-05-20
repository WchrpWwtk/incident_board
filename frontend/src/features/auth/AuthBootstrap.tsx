import { type PropsWithChildren, useEffect } from "react";
import { useAuth } from "@/features/auth/auth.store.tsx";
import { useQuery } from "@tanstack/react-query";
import { getProfile } from "@/features/auth/auth.api.ts";

export function AuthBootstrap({ children }: PropsWithChildren) {
	const { setUser } = useAuth();

	const profileQuery = useQuery({
		queryKey: ["auth", "profile"],
		queryFn: getProfile,
		retry: false,
	});

	useEffect(() => {
		if (profileQuery.data) {
			setUser(profileQuery.data);
		}
	}, [profileQuery.data, setUser]);

	if (profileQuery.isLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<p className="text-sm text-muted-foreground">Loading session...</p>
			</div>
		);
	}

	return children;
}
