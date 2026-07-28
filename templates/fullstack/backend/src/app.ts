import { Gaman, composeRouter } from "gaman";
import type { Context } from "gaman";
import { runMigrations } from "./database/migrations";
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

const router = composeRouter((r) => {
	r.get("/api/hello", handle);
	r.post("/api/auth/register", handle);
	r.post("/api/auth/login", handle);
	r.get("/api/auth/me", handle);
	r.post("/api/auth/logout", handle);
	r.post("/api/auth/refresh", handle);
	r.post("/api/auth/forgot-password", handle);
	r.post("/api/auth/reset-password", handle);
	r.get("/api/users", handle);
	r.post("/api/users", handle);
	r.patch("/api/users/:id", handle);
	r.delete("/api/users/:id", handle);
	r.get("/api/cms/posts", handle);
	r.post("/api/cms/posts", handle);
	r.post("/api/cms/media", handle);
	r.patch("/api/cms/posts/:id", handle);
	r.delete("/api/cms/posts/:id", handle);
});

const app = new Gaman();

await app.mount(router);

app.mountServer({ http: env.port });

console.log(`\n  ⩛ Rakta.js Backend (Gaman.js) running at http://localhost:${env.port}\n`);
