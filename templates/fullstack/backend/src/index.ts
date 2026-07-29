import { runMigrations } from "./database/migrations/index";
import { env } from "./env";
import { createAppRouter } from "./modules/app/AppRouter";
import { seedCmsPosts } from "./services/cms.service";
import { seedUsers } from "./services/user.service";

await runMigrations();
await seedUsers();
seedCmsPosts();

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
