import {
	forgotPasswordController,
	loginController,
	logoutAllController,
	logoutController,
	meController,
	refreshController,
	registerController,
	resetPasswordController,
} from "../controllers/auth.controller";
import {
	destroyCmsPostController,
	indexCmsPostsController,
	storeCmsPostController,
	updateCmsPostController,
	uploadCmsMediaController,
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
	const method = request.method.toUpperCase();

	if (url.pathname === "/api/hello" && method === "GET") {
		return ok(helloController());
	}

	// Auth routes
	if (url.pathname === "/api/auth/register" && method === "POST") {
		return registerController(request);
	}
	if (url.pathname === "/api/auth/login" && method === "POST") {
		return loginController(request);
	}
	if (url.pathname === "/api/auth/refresh" && method === "POST") {
		return refreshController(request);
	}
	if (url.pathname === "/api/auth/me" && method === "GET") {
		return meController(request);
	}
	if (url.pathname === "/api/auth/logout" && method === "POST") {
		return logoutController(request);
	}
	if (url.pathname === "/api/auth/logout-all" && method === "POST") {
		return logoutAllController(request);
	}
	if (url.pathname === "/api/auth/forgot-password" && method === "POST") {
		return forgotPasswordController(request);
	}
	if (url.pathname === "/api/auth/reset-password" && method === "POST") {
		return resetPasswordController(request);
	}

	// User routes (protected)
	if (url.pathname === "/api/users" && method === "GET") {
		const rejected = await requireAuth(request);
		return rejected ?? indexUsersController();
	}
	if (url.pathname === "/api/users" && method === "POST") {
		const rejected = await requireAuth(request);
		return rejected ?? storeUserController(request);
	}
	if (userMatch?.[1] !== undefined && method === "PATCH") {
		const rejected = await requireAuth(request);
		return rejected ?? updateUserController(userMatch[1], request);
	}
	if (userMatch?.[1] !== undefined && method === "DELETE") {
		const rejected = await requireAuth(request);
		return rejected ?? destroyUserController(userMatch[1]);
	}

	// CMS routes (protected)
	if (url.pathname === "/api/cms/posts" && method === "GET") {
		const rejected = await requireAuth(request);
		return rejected ?? indexCmsPostsController();
	}
	if (url.pathname === "/api/cms/posts" && method === "POST") {
		const rejected = await requireAuth(request);
		return rejected ?? storeCmsPostController(request);
	}
	if (url.pathname === "/api/cms/media" && method === "POST") {
		const rejected = await requireAuth(request);
		return rejected ?? uploadCmsMediaController(request);
	}
	if (cmsPostMatch?.[1] !== undefined && method === "PATCH") {
		const rejected = await requireAuth(request);
		return rejected ?? updateCmsPostController(cmsPostMatch[1], request);
	}
	if (cmsPostMatch?.[1] !== undefined && method === "DELETE") {
		const rejected = await requireAuth(request);
		return rejected ?? destroyCmsPostController(cmsPostMatch[1]);
	}

	return fail("Not found.", 404);
}
