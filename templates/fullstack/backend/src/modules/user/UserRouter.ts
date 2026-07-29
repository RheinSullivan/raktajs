import {
	destroyUserController,
	indexUsersController,
	storeUserController,
	updateUserController,
} from "./controllers/UserController";

export async function userRouter(
	request: Request,
): Promise<Response | undefined> {
	const url = new URL(request.url);
	const method = request.method.toUpperCase();
	const userMatch = url.pathname.match(/^\/api\/users\/([^/]+)$/);

	if (url.pathname === "/api/users" && method === "GET") {
		return indexUsersController();
	}

	if (url.pathname === "/api/users" && method === "POST") {
		return storeUserController(request);
	}

	if (userMatch?.[1] !== undefined && method === "PATCH") {
		return updateUserController(userMatch[1], request);
	}

	if (userMatch?.[1] !== undefined && method === "DELETE") {
		return destroyUserController(userMatch[1]);
	}

	return undefined;
}
