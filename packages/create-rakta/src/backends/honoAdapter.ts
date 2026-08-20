import type { ProjectConfig, ProjectFile } from "../types";
import type { BackendAdapter, BackendCapabilities } from "./backendAdapter";

export const honoCapabilities: BackendCapabilities = {
	framework: "hono",
	language: "JavaScript / TypeScript",
	runtime: "Bun / Node.js / Deno / Cloudflare Workers",
	defaultDatabase: "postgresql",
	supportedDatabases: [
		"postgresql",
		"mysql",
		"sawitdb",
		"sqlite",
		"cloudflare-d1",
	],
	authentication: "hono/jwt / Middleware Guards",
	middleware: "hono/cors / Hono Middleware Pipeline",
	validation: "@hono/zod-validator",
	apiType: "REST / Web Standards API",
	developmentCommand: "bun run dev",
	productionCommand: "bun run start",
	databaseDriver: "SawitDB-TS / Drizzle ORM / Kysely",
	sawitDatabaseSupport: true,
	generationStatus: "IMPLEMENTED",
};

export const honoAdapter: BackendAdapter = {
	identifier: "hono",
	name: "Hono.js",
	language: "JavaScript / TypeScript",
	runtime: "Bun / Multi-Runtime",
	capabilities: honoCapabilities,
	generateFiles(projectConfiguration: ProjectConfig): ProjectFile[] {
		const projectName = projectConfiguration.projectName;
		const isSawitDatabase = projectConfiguration.database === "sawitdb";

		const packageJsonContent = JSON.stringify(
			{
				name: `${projectName}-backend`,
				version: "0.1.0",
				private: true,
				type: "module",
				scripts: {
					dev: "bun --watch src/index.ts",
					start: "bun src/index.ts",
					build: "bun build src/index.ts --outdir=dist",
				},
				dependencies: {
					hono: "^4.0.0",
					...(isSawitDatabase ? { sawitdb: "^1.0.0" } : {}),
				},
				devDependencies: {
					"@types/bun": "latest",
					typescript: "^5.3.3",
				},
			},
			null,
			2,
		);

		const indexContent = `import { Hono } from "hono";
import { cors } from "hono/cors";

const application = new Hono();
const port = Number(process.env.PORT) || 4000;

application.use("*", cors({ origin: "http://localhost:3000" }));

application.get("/health", (context) => {
  return context.json({
    status: "ok",
    framework: "Hono.js",
    runtime: typeof Bun !== "undefined" ? "Bun" : "Node/WebStandards",
    timestamp: new Date().toISOString(),
  });
});

application.get("/api/users", (context) => {
  return context.json([
    { id: "usr_1", name: "Rhein Sullivan" },
    { id: "usr_2", name: "Hono Developer" },
  ]);
});

${
	isSawitDatabase
		? `application.get("/api/sawit-status", (context) => {
  return context.json({
    database: "SawitDB Engine",
    status: "connected",
  });
});
`
		: ""
}

export default {
  port,
  fetch: application.fetch,
};

if (typeof Bun !== "undefined") {
  Bun.serve({
    port,
    fetch: application.fetch,
  });
  console.log(\`Hono.js backend running on http://localhost:\${port}\`);
}
`;

		return [
			{ path: "backend/package.json", content: packageJsonContent },
			{ path: "backend/src/index.ts", content: indexContent },
			{
				path: "backend/README.md",
				content: `# ${projectName} Backend (Hono.js)\n\nWeb-standard multi-runtime JavaScript framework.\n\n## Commands\n- Dev: \`bun run dev\`\n- Start: \`bun run start\`\n`,
			},
		];
	},
};
