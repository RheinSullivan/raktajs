import {
	destroyUserController,
	indexUsersController,
	storeUserController,
	updateUserController,
} from "./controllers/UserController";
import { requireAuth } from "../../middlewares/auth.middleware";

export async function userRouter(
	request: Request,
): Promise<Response | undefined> {
	const url = new URL(request.url);
	const method = request.method.toUpperCase();
	const userMatch = url.pathname.match(/^\/api\/users\/([^/]+)$/);

	if (url.pathname === "/api/users" && method === "GET") {
		const rejectedResponse = await requireAuth(request);
		return rejectedResponse ?? indexUsersController();
	}

	if (url.pathname === "/api/users" && method === "POST") {
		const rejectedResponse = await requireAuth(request);
		return rejectedResponse ?? storeUserController(request);
	}

	if (userMatch?.[1] !== undefined && method === "PATCH") {
		const rejectedResponse = await requireAuth(request);
		return rejectedResponse ?? updateUserController(userMatch[1], request);
	}

	if (userMatch?.[1] !== undefined && method === "DELETE") {
		const rejectedResponse = await requireAuth(request);
		return rejectedResponse ?? destroyUserController(userMatch[1]);
	}

	return undefined;
}
