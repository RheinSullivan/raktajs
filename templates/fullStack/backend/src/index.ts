import { runMigrations } from "./database/migrations/index";
import { runDatabaseSeeders } from "./database/seeders/index";
import { env } from "./env";
import { createAppRouter } from "./modules/app/AppRouter";

await runMigrations();
await runDatabaseSeeders();

const appRouter = createAppRouter({
	corsOrigin: env.corsOrigin,
});

Bun.serve({
	port: env.port,
	fetch: (request) => appRouter.handle(request),
});

console.log(
	`\n  Rakta.js Backend (Gaman.js profile) running at http://localhost:${env.port}\n`,
);
