import { useForm } from "react-hook-form";
import {
	type LoginFormValues,
	loginSchema,
} from "@/features/auth/login.schema.ts";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { login } from "@/features/auth/auth.api.ts";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Button } from "@/components/ui/button.tsx";
import { useAuth } from "@/features/auth/auth.store.tsx";
import { useNavigate } from "react-router-dom";

export function LoginPage() {
	const navigate = useNavigate();
	const { setUser } = useAuth();
	const form = useForm<LoginFormValues>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			username: "",
			password: "",
		},
	});

	const loginMutation = useMutation({
		mutationFn: login,
		onSuccess: (data) => {
			setUser(data.user);
			navigate("/dashboard");
		},
	});

	function onSubmit(values: LoginFormValues) {
		loginMutation.mutate(values);
	}

	return (
		<main className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
			<Card className="w-full max-w-md">
				<CardHeader>
					<CardTitle>IncidentBoard</CardTitle>
					<CardDescription>Sign in to manage incidents</CardDescription>
				</CardHeader>
				<CardContent>
					<form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
						<div className="space-y-2">
							<Label htmlFor="username">Username</Label>
							<Input id="username" {...form.register("username")} />
							{form.formState.errors.username && (
								<p className="text-sm text-destructive">
									{form.formState.errors.username.message}
								</p>
							)}
						</div>
						<div className="space-y-2">
							<Label htmlFor="password">Password</Label>
							<Input
								id="password"
								type="password"
								{...form.register("password")}
							/>
							{form.formState.errors.password && (
								<p className="text-sm text-destructive">
									{form.formState.errors.password.message}
								</p>
							)}
						</div>
						{loginMutation.isError && (
							<p className="text-sm text-destructive">
								Invalid username or password.
							</p>
						)}
						<Button
							className="w-full"
							type="submit"
							disabled={loginMutation.isPending}
						>
							{loginMutation.isPending ? "Signing in..." : "Sign in"}
						</Button>
					</form>
				</CardContent>
			</Card>
		</main>
	);
}
