import { Gaman, type GamanContext, type HTTP } from "gaman";
import { runMigrations } from "./database/migrations";
import { env } from "./env";
import { requestFromGamanContext, sendGamanResponse } from "./http/gaman";
import { apiRouter } from "./routes/api";
import { seedCmsPosts } from "./services/cms.service";
import { seedUsers } from "./services/user.service";

const app = new Gaman<HTTP>();

await runMigrations();
await seedUsers();
seedCmsPosts();

function setCorsHeaders(context: GamanContext): void {
	context.setHeader("Access-Control-Allow-Origin", env.corsOrigin);
	context.setHeader(
		"Access-Control-Allow-Methods",
		"GET, POST, PUT, PATCH, DELETE, OPTIONS",
	);
	context.setHeader(
		"Access-Control-Allow-Headers",
		"Content-Type, Authorization",
	);
	context.setHeader("Access-Control-Allow-Credentials", "true");
}

async function handle(context: GamanContext): Promise<unknown> {
	// Handle CORS preflight requests
	if ((context.method ?? "").toUpperCase() === "OPTIONS") {
		setCorsHeaders(context);
		return context.status(204).send(undefined);
	}

	const response = await apiRouter(requestFromGamanContext(context));
	const headers = new Headers(response.headers);

	headers.set("Access-Control-Allow-Origin", env.corsOrigin);
	headers.set(
		"Access-Control-Allow-Methods",
		"GET, POST, PUT, PATCH, DELETE, OPTIONS",
	);
	headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
	headers.set("Access-Control-Allow-Credentials", "true");

	return sendGamanResponse(
		context,
		new Response(response.body, {
			status: response.status,
			headers,
		}),
	);
}

app.get("/api/hello", handle);
app.post("/api/auth/register", handle);
app.post("/api/auth/login", handle);
app.get("/api/auth/me", handle);
app.post("/api/auth/logout", handle);
app.post("/api/auth/forgot-password", handle);
app.post("/api/auth/reset-password", handle);
app.get("/api/users", handle);
app.post("/api/users", handle);
app.patch("/api/users/:id", handle);
app.delete("/api/users/:id", handle);
app.get("/api/cms/posts", handle);
app.post("/api/cms/posts", handle);
app.post("/api/cms/media", handle);
app.patch("/api/cms/posts/:id", handle);
app.delete("/api/cms/posts/:id", handle);

app.mountServer({
	http: env.port,
});

console.log(`Rakta Gaman.js backend running at http://localhost:${env.port}`);
