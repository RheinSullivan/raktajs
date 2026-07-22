import { Gaman, type HTTP } from "gaman";
import { runMigrations } from "./database/migrations";
import { env } from "./env";
import { requestFromGamanContext, sendGamanResponse } from "./http/gaman";
import { apiRouter } from "./routes/api";
import { seedCmsPosts } from "./services/cms.service";
import { seedUsers } from "./services/user.service";

const app = Gaman<HTTP>();
const corsHeaders: Readonly<Record<string, string>> = {
	"Access-Control-Allow-Origin": env.corsOrigin,
	"Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
	"Access-Control-Allow-Headers": "Content-Type, Authorization",
	"Access-Control-Allow-Credentials": "true",
};

await runMigrations();
await seedUsers();
seedCmsPosts();

async function handle(context: Parameters<Parameters<typeof app.get>[1]>[0]) {
	const response = await apiRouter(requestFromGamanContext(context));
	const headers = new Headers(response.headers);

	for (const [key, value] of Object.entries(corsHeaders)) {
		headers.set(key, value);
	}

	return sendGamanResponse(
		context,
		new Response(response.body, {
			status: response.status,
			headers,
		}),
	);
}

app.options("/*", (context) => {
	context
		.status(204)
		.setHeader("Access-Control-Allow-Origin", env.corsOrigin)
		.setHeader(
			"Access-Control-Allow-Methods",
			"GET, POST, PUT, PATCH, DELETE, OPTIONS",
		)
		.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization")
		.setHeader("Access-Control-Allow-Credentials", "true");

	return context.send(undefined);
});

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
