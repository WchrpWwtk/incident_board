import axios, { AxiosError } from "axios";

export const api = axios.create({
	baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api",
	withCredentials: true,
});

let isRefreshing = false;

api.interceptors.response.use(
	(response) => response,
	async (error: AxiosError) => {
		const originalRequest = error.config;

		if (
			error.response?.status === 401 &&
			originalRequest &&
			!originalRequest.url?.includes("/auth/login/") &&
			!originalRequest.url?.includes("/auth/refresh/") &&
			!originalRequest.headers["x-retry"]
		) {
			if (isRefreshing) {
				return Promise.reject(error);
			}

			isRefreshing = true;

			try {
				await api.post("/auth/refresh/");

				originalRequest.headers["x-retry"] = "true";

				return api(originalRequest);
			} catch (refreshError) {
				return Promise.reject(refreshError);
			} finally {
				isRefreshing = false;
			}
		}

		return Promise.reject(error);
	},
);
