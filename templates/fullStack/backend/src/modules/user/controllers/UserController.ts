import { readJson } from "../../../http/request";
import { created, fail, ok } from "../../../http/response";
import { UserService } from "../services/UserService";

const userService = new UserService();

export class UserController {
	indexUsers(): Response {
		return ok(userService.listUsers());
	}

	async storeUser(request: Request): Promise<Response> {
		try {
			const body = (await readJson(request)) as Record<string, unknown>;
			const user = await userService.createUser({
				firstName: String(body.firstName ?? body.name ?? ""),
				lastName: String(body.lastName ?? ""),
				email: String(body.email ?? ""),
				password: String(body.password ?? ""),
			});

			return created(user);
		} catch (error) {
			return fail(
				error instanceof Error ? error.message : "Create user failed.",
			);
		}
	}

	async updateUser(userId: string, request: Request): Promise<Response> {
		const body = (await readJson(request)) as Record<string, unknown>;
		const input: {
			firstName?: string;
			lastName?: string;
			name?: string;
			email?: string;
			password?: string;
		} = {};

		if (typeof body.name === "string") {
			input.name = body.name;
		}
		if (typeof body.firstName === "string") {
			input.firstName = body.firstName;
		}
		if (typeof body.lastName === "string") {
			input.lastName = body.lastName;
		}
		if (typeof body.email === "string") {
			input.email = body.email;
		}
		if (typeof body.password === "string") {
			input.password = body.password;
		}

		const user = await userService.updateUser(userId, input);
		return user === undefined ? fail("User not found.", 404) : ok(user);
	}

	destroyUser(userId: string): Response {
		return userService.deleteUser(userId)
			? ok({ deleted: true })
			: fail("User not found.", 404);
	}
}

const userControllerInstance = new UserController();
export const indexUsersController = () => userControllerInstance.indexUsers();
export const storeUserController = (req: Request) =>
	userControllerInstance.storeUser(req);
export const updateUserController = (id: string, req: Request) =>
	userControllerInstance.updateUser(id, req);
export const destroyUserController = (id: string) =>
	userControllerInstance.destroyUser(id);
