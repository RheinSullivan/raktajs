export async function readJson(
	request: Request,
): Promise<Record<string, unknown>> {
	try {
		return (await request.json()) as Record<string, unknown>;
	} catch {
		return {};
	}
}

export function readSessionCookie(request: Request): string | undefined {
	return request.headers
		.get("cookie")
		?.split(";")
		.map((cookie) => cookie.trim())
		.find((cookie) => cookie.startsWith("rakta_session="))
		?.slice("rakta_session=".length);
}
