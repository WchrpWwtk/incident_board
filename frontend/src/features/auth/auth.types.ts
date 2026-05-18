export type UserRole = "admin" | "reporter" | "processor" | "manager";

export type User = {
	id: number;
	username: string;
	email: string;
	first_name: string;
	last_name: string;
	role: UserRole;
};

export type LoginPayload = {
	username: string;
	password: string;
};

export type LoginResponse = {
	user: User;
};
