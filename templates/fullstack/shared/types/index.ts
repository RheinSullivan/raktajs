export interface ApiResponse<TData = unknown> {
	readonly success: boolean;
	readonly data?: TData;
	readonly error?: string;
}

export interface User {
	readonly id: string;
	readonly email: string;
	readonly name: string;
}
