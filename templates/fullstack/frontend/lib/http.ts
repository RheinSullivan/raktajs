export const API_URL = process.env.API_URL ?? "http://localhost:4000";

export async function apiGet<TData>(path: string): Promise<TData> {
	const response = await fetch(`${API_URL}${path}`, {
		credentials: "include",
	});

	if (!response.ok) {
		throw new Error(`Request failed with status ${response.status}`);
	}

	return response.json() as Promise<TData>;
}
