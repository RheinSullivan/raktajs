import { readJson } from "../http/request";
import { created, fail, ok } from "../http/response";
import {
	createUser,
	deleteUser,
	listUsers,
	updateUser,
} from "../services/user.service";

export function indexUsersController(): Response {
	return ok(listUsers());
}

export async function storeUserController(request: Request): Promise<Response> {
	try {
		const body = await readJson(request);
		const user = await createUser({
			name: String(body.name ?? ""),
			email: String(body.email ?? ""),
			password: String(body.password ?? ""),
		});

		return created(user);
	} catch (error) {
		return fail(error instanceof Error ? error.message : "Create user failed.");
	}
}

export async function updateUserController(
	userId: string,
	request: Request,
): Promise<Response> {
	const body = await readJson(request);
	const input: {
		name?: string;
		email?: string;
		password?: string;
	} = {};

	if (typeof body.name === "string") {
		input.name = body.name;
	}

	if (typeof body.email === "string") {
		input.email = body.email;
	}

	if (typeof body.password === "string") {
		input.password = body.password;
	}

	const user = await updateUser(userId, input);

	return user === undefined ? fail("User not found.", 404) : ok(user);
}

export function destroyUserController(userId: string): Response {
	return deleteUser(userId)
		? ok({ deleted: true })
		: fail("User not found.", 404);
}
