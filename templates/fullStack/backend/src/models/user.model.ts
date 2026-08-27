export type UserRole =
	| "Super Admin"
	| "Organization"
	| "Administrator"
	| "ADMIN"
	| "USER"
	| "GUEST";
export type Gender = "MALE" | "FEMALE" | "OTHER";

export interface User {
	id: string;
	firstName: string;
	lastName: string;
	name: string;
	email: string;
	passwordHash: string;
	role: UserRole;
	gender: Gender;
	createdAt: string;
	updatedAt: string;
}

export interface PublicUser {
	id: string;
	firstName: string;
	lastName: string;
	name: string;
	email: string;
	role: UserRole;
	gender: Gender;
	createdAt: string;
	updatedAt: string;
}

export function toPublicUser(user: User): PublicUser {
	return {
		id: user.id,
		firstName: user.firstName,
		lastName: user.lastName,
		name: user.name,
		email: user.email,
		role: user.role,
		gender: user.gender,
		createdAt: user.createdAt,
		updatedAt: user.updatedAt,
	};
}
