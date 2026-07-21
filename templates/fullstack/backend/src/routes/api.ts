import {
	forgotPasswordController,
	loginController,
	logoutController,
	meController,
	registerController,
	resetPasswordController,
} from "../controllers/auth.controller";
import {
	destroyCmsPostController,
	indexCmsPostsController,
	storeCmsPostController,
	updateCmsPostController,
} from "../controllers/cms.controller";
import { helloController } from "../controllers/hello.controller";
import {
	destroyUserController,
	indexUsersController,
	storeUserController,
	updateUserController,
} from "../controllers/user.controller";
import { fail, ok } from "../http/response";
import { requireAuth } from "../middlewares/auth.middleware";

export async function apiRouter(request: Request): Promise<Response> {
	const url = new URL(request.url);
	const userMatch = url.pathname.match(/^\/api\/users\/([^/]+)$/);
	const cmsPostMatch = url.pathname.match(/^\/api\/cms\/posts\/([^/]+)$/);

	if (url.pathname === "/api/hello" && request.method === "GET") {
		return ok(helloController());
	}

	if (url.pathname === "/api/auth/register" && request.method === "POST") {
		return registerController(request);
	}

	if (url.pathname === "/api/auth/login" && request.method === "POST") {
		return loginController(request);
	}

	if (url.pathname === "/api/auth/me" && request.method === "GET") {
		return meController(request);
	}

	if (url.pathname === "/api/auth/logout" && request.method === "POST") {
		return logoutController(request);
	}

	if (
		url.pathname === "/api/auth/forgot-password" &&
		request.method === "POST"
	) {
		return forgotPasswordController(request);
	}

	if (
		url.pathname === "/api/auth/reset-password" &&
		request.method === "POST"
	) {
		return resetPasswordController(request);
	}

	if (url.pathname === "/api/users" && request.method === "GET") {
		const rejected = await requireAuth(request);
		return rejected ?? indexUsersController();
	}

	if (url.pathname === "/api/users" && request.method === "POST") {
		const rejected = await requireAuth(request);
		return rejected ?? storeUserController(request);
	}

	if (userMatch?.[1] !== undefined && request.method === "PATCH") {
		const rejected = await requireAuth(request);
		return rejected ?? updateUserController(userMatch[1], request);
	}

	if (userMatch?.[1] !== undefined && request.method === "DELETE") {
		const rejected = await requireAuth(request);
		return rejected ?? destroyUserController(userMatch[1]);
	}

	if (url.pathname === "/api/cms/posts" && request.method === "GET") {
		const rejected = await requireAuth(request);
		return rejected ?? indexCmsPostsController();
	}

	if (url.pathname === "/api/cms/posts" && request.method === "POST") {
		const rejected = await requireAuth(request);
		return rejected ?? storeCmsPostController(request);
	}

	if (cmsPostMatch?.[1] !== undefined && request.method === "PATCH") {
		const rejected = await requireAuth(request);
		return rejected ?? updateCmsPostController(cmsPostMatch[1], request);
	}

	if (cmsPostMatch?.[1] !== undefined && request.method === "DELETE") {
		const rejected = await requireAuth(request);
		return rejected ?? destroyCmsPostController(cmsPostMatch[1]);
	}

	return fail("Not found.", 404);
}
