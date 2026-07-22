import { authenticate } from "../auth/auth.service";

export async function requireAuth(
	request: Request,
): Promise<Response | undefined> {
	const user = await authenticate(request);

	if (user === undefined) {
		return Response.json(
			{ success: false, error: "Unauthorized" },
			{ status: 401 },
		);
	}

	return undefined;
}
