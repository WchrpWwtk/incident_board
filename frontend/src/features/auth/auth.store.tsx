import type { User } from "@/features/auth/auth.types.ts";
import {
	createContext,
	type PropsWithChildren,
	useContext,
	useState,
} from "react";

type AuthContextValue = {
	user: User | null;
	setUser: (user: User | null) => void;
	isAuthenticated: boolean;
	isInitialized: boolean;
	setInitialized: (value: boolean) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
	const [user, setUser] = useState<User | null>(null);
	const [isInitialized, setInitialized] = useState(false);

	return (
		<AuthContext.Provider
			value={{
				user,
				setUser,
				isAuthenticated: Boolean(user),
				isInitialized,
				setInitialized,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const context = useContext(AuthContext);

	if (!context) {
		throw new Error("useAuth must be used inside AuthProvider");
	}

	return context;
}
