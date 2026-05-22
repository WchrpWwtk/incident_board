import { type PropsWithChildren, useEffect } from "react";
import { useAuth } from "@/features/auth/auth.store.tsx";
import { useQuery } from "@tanstack/react-query";
import { getProfile } from "@/features/auth/auth.api.ts";

export function AuthBootstrap({ children }: PropsWithChildren) {
	const { setUser, setInitialized } = useAuth();

	const profileQuery = useQuery({
		queryKey: ["auth", "profile"],
		queryFn: getProfile,
		retry: false,
	});

	useEffect(() => {
		if (profileQuery.data) {
			setUser(profileQuery.data);
		}

		if (profileQuery.isSuccess || profileQuery.isError) {
			setInitialized(true);
		}
	}, [
		profileQuery.data,
		profileQuery.isSuccess,
		profileQuery.isError,
		setUser,
		setInitialized,
	]);

	if (!profileQuery.isSuccess && !profileQuery.isError) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<p className="text-sm text-muted-foreground">Loading session...</p>
			</div>
		);
	}

	return children
}
