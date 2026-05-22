import { LoginPage } from "@/features/auth/LoginPage.tsx";
import * as React from "react";
import { useAuth } from "@/features/auth/auth.store.tsx";
import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout.tsx";
import { lazy } from "react";

const DashboardPage = lazy(() =>
	import("@/features/dashboard/DashboardPage").then((module) => ({
		default: module.DashboardPage,
	})),
);

const IncidentListPage = lazy(() =>
	import("@/features/incidents/IncidentListPage").then((module) => ({
		default: module.IncidentListPage,
	})),
);

const IncidentDetailPage = lazy(() =>
	import("@/features/incidents/IncidentDetailPage").then((module) => ({
		default: module.IncidentDetailPage,
	})),
);

const CreateIncidentPage = lazy(() =>
	import("@/features/incidents/CreateIncidentPage").then((module) => ({
		default: module.CreateIncidentPage,
	})),
);

const EditIncidentPage = lazy(() =>
	import("@/features/incidents/EditIncidentPage").then((module) => ({
		default: module.EditIncidentPage,
	})),
);

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
				<Route path="/incidents/:id/edit" element={<EditIncidentPage />} />
			</Route>
			<Route path="*" element={<Navigate to="/dashboard" replace />} />
		</Routes>
	);
}

export default App;
