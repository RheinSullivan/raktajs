// @ts-ignore - gaman is installed in the generated project, not in the monorepo workspace
import { Gaman, composeRouter } from "gaman";
// @ts-ignore
import type { Context } from "gaman"; import { runMigrations } from "./database/migrations";
import { env } from "./env";
import { apiRouter } from "./routes/api";
import { seedCmsPosts } from "./services/cms.service";
import { seedUsers } from "./services/user.service";

const CORS_HEADERS = {
	"Access-Control-Allow-Origin": env.corsOrigin,
	"Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
	"Access-Control-Allow-Headers": "Content-Type, Authorization",
	"Access-Control-Allow-Credentials": "true",
};

await runMigrations();
await seedUsers();
seedCmsPosts();

async function handle(c: Context): Promise<Response> {
	// OPTIONS preflight
	if (c.request.method.toUpperCase() === "OPTIONS") {
		return new Response(null, { status: 204, headers: CORS_HEADERS });
	}

	// Build a standard Request from the Gaman context
	// context.request is a Bun Request in Gaman v2.x
	const req: Request =
		c.request instanceof Request
			? c.request
			: new Request(
				`http://localhost:${env.port}${c.path ?? "/"}`,
				{ method: c.request.method ?? "GET" },
			);

	const response = await apiRouter(req);

	const headers = new Headers(response.headers);
	for (const [key, value] of Object.entries(CORS_HEADERS)) {
		headers.set(key, value);
	}

	return new Response(response.body, {
		status: response.status,
		headers,
	});
}

// biome-ignore lint/suspicious/noExplicitAny: routerBuilder is RouterBuilder from gaman - typed at runtime
const router = composeRouter((routerBuilder: any) => {
	routerBuilder.get("/api/hello", handle);
	routerBuilder.post("/api/auth/register", handle);
	routerBuilder.post("/api/auth/login", handle);
	routerBuilder.post("/api/auth/refresh", handle);
	routerBuilder.get("/api/auth/me", handle);
	routerBuilder.post("/api/auth/logout", handle);
	routerBuilder.post("/api/auth/logout-all", handle);
	routerBuilder.post("/api/auth/forgot-password", handle);
	routerBuilder.post("/api/auth/reset-password", handle);
	routerBuilder.get("/api/users", handle);
	routerBuilder.post("/api/users", handle);
	routerBuilder.patch("/api/users/:id", handle);
	routerBuilder.delete("/api/users/:id", handle);
	routerBuilder.get("/api/cms/posts", handle);
	routerBuilder.post("/api/cms/posts", handle);
	routerBuilder.post("/api/cms/media", handle);
	routerBuilder.patch("/api/cms/posts/:id", handle);
	routerBuilder.delete("/api/cms/posts/:id", handle);
});

const app = new Gaman();

await app.mount(router);

app.mountServer({ http: env.port });

console.log(`\n  ⩛ Rakta.js Backend (Gaman.js) running at http://localhost:${env.port}\n`);
