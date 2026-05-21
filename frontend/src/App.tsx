import { LoginPage } from "@/features/auth/LoginPage.tsx";
import * as React from "react";
import { useAuth } from "@/features/auth/auth.store.tsx";
import { Navigate, Route, Routes } from "react-router-dom";
import { DashboardPage } from "@/features/dashboard/DashboardPage.tsx";
import { AppLayout } from "@/components/layout/AppLayout.tsx";
import { IncidentListPage } from "@/features/incidents/IncidentListPage.tsx";
import { IncidentDetailPage } from "@/features/incidents/IncidentDetailPage.tsx";
import { CreateIncidentPage } from "@/features/incidents/CreateIncidentPage.tsx";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
	const { isAuthenticated } = useAuth();

	if (!isAuthenticated) {
		return <Navigate to="/login" replace />;
	}

	return children;
}

function App() {
	return (
		<Routes>
			<Route path="/login" element={<LoginPage />} />
			<Route
				element={
					<ProtectedRoute>
						<AppLayout />
					</ProtectedRoute>
				}
			>
				<Route path="/dashboard" element={<DashboardPage />} />
				<Route path="/incidents" element={<IncidentListPage />} />
				<Route path="/incidents/new" element={<CreateIncidentPage />} />
				<Route path="/incidents/:id" element={<IncidentDetailPage />} />
			</Route>
			<Route path="*" element={<Navigate to="/dashboard" replace />} />
		</Routes>
	);
}

export default App;
