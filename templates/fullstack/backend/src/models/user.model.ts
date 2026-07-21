export interface User {
	readonly id: string;
	readonly name: string;
	readonly email: string;
	readonly passwordHash: string;
	readonly role: "owner" | "admin" | "editor" | "member";
	readonly createdAt: string;
	readonly updatedAt: string;
}

export interface PublicUser {
	readonly id: string;
	readonly name: string;
	readonly email: string;
	readonly role: User["role"];
	readonly createdAt: string;
	readonly updatedAt: string;
}

export function toPublicUser(user: User): PublicUser {
	return {
		id: user.id,
		name: user.name,
		email: user.email,
		role: user.role,
		createdAt: user.createdAt,
		updatedAt: user.updatedAt,
	};
}
