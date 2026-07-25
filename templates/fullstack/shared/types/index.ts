export type UserRole = "ADMIN" | "USER" | "GUEST";
export type Gender = "MALE" | "FEMALE" | "OTHER";

export interface ApiResponse<TData = unknown> {
	success: boolean;
	data?: TData;
	error?: string;
}

export interface User {
	id: string;
	email: string;
	firstName: string;
	lastName: string;
	name: string;
	role: UserRole;
	gender: Gender;
}
