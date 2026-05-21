import type {
	LoginPayload,
	LoginResponse,
	User,
} from "@/features/auth/auth.types.ts";
import { api } from "@/lib/api.ts";

export async function login(payload: LoginPayload): Promise<LoginResponse> {
	const response = await api.post<LoginResponse>("/auth/login/", payload);

	return response.data;
}

export async function logout(): Promise<void> {
	await api.post("/auth/logout/");
}

export async function getProfile(): Promise<User> {
	const response = await api.get<User>("/auth/profile/");

	return response.data;
}
