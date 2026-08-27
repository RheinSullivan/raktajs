import { apiRouter } from "../../routes/api";
import { AppController } from "./controllers/AppController";
import { AppService } from "./services/AppService";

export interface AppRouterOptions {
	readonly corsOrigin: string;
}

export class AppRouter {
	readonly #controller = new AppController();
	readonly #service = new AppService();
	readonly #corsHeaders: Headers;

	constructor(options: AppRouterOptions) {
		this.#corsHeaders = this.#service.createCorsHeaders(options.corsOrigin);
	}

	async handle(request: Request): Promise<Response> {
		if (request.method.toUpperCase() === "OPTIONS") {
			return new Response(null, { status: 204, headers: this.#corsHeaders });
		}

		const url = new URL(request.url);
		const response =
			url.pathname === "/"
				? this.#controller.index()
				: url.pathname === "/health"
					? this.#controller.health()
					: await apiRouter(request);

		return this.#withCors(response);
	}

	#withCors(response: Response): Response {
		const headers = new Headers(response.headers);

		for (const [key, value] of this.#corsHeaders.entries()) {
			headers.set(key, value);
		}

		return new Response(response.body, {
			status: response.status,
			headers,
		});
	}
}

export function createAppRouter(options: AppRouterOptions): AppRouter {
	return new AppRouter(options);
}
