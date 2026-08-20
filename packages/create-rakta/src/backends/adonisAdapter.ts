import type { ProjectConfig, ProjectFile } from "../types";
import type { BackendAdapter, BackendCapabilities } from "./backendAdapter";

export const adonisCapabilities: BackendCapabilities = {
	framework: "adonis",
	language: "JavaScript / TypeScript",
	runtime: "Node.js",
	defaultDatabase: "postgresql",
	supportedDatabases: ["postgresql", "mysql", "sqlite"],
	authentication: "@adonisjs/auth (Session / API Tokens)",
	middleware: "AdonisJS Middleware Stack",
	validation: "VineJS Validation",
	apiType: "REST / Fullstack",
	developmentCommand: "node ace serve --watch",
	productionCommand: "node build/bin/server.js",
	databaseDriver: "@adonisjs/lucid (Lucid ORM)",
	sawitDatabaseSupport: false,
	generationStatus: "IMPLEMENTED",
};

export const adonisAdapter: BackendAdapter = {
	identifier: "adonis",
	name: "Adonis.js",
	language: "JavaScript / TypeScript",
	runtime: "Node.js",
	capabilities: adonisCapabilities,
	generateFiles(projectConfiguration: ProjectConfig): ProjectFile[] {
		const projectName = projectConfiguration.projectName;

		const packageJsonContent = JSON.stringify(
			{
				name: `${projectName}-backend`,
				version: "0.1.0",
				private: true,
				type: "module",
				scripts: {
					dev: "node ace serve --watch",
					build: "node ace build",
					start: "node build/bin/server.js",
				},
				dependencies: {
					"@adonisjs/core": "^6.2.0",
					"@adonisjs/cors": "^1.0.0",
				},
				devDependencies: {
					typescript: "^5.3.3",
				},
			},
			null,
			2,
		);

		const serverContent = `import { Ignitor } from "@adonisjs/core";

new Ignitor(new URL("../", import.meta.url))
  .tap((application) => {
    application.booting(() => {
      console.log("Adonis.js application booting...");
    });
  })
  .httpServer()
  .start();
`;

		const routesContent = `import router from "@adonisjs/core/services/router";

router.get("/health", async () => {
  return { status: "ok", framework: "Adonis.js" };
});

router.get("/api/users", async () => {
  return [
    { id: "usr_1", name: "Rhein Sullivan" },
    { id: "usr_2", name: "Adonis Developer" },
  ];
});
`;

		return [
			{ path: "backend/package.json", content: packageJsonContent },
			{ path: "backend/bin/server.ts", content: serverContent },
			{ path: "backend/start/routes.ts", content: routesContent },
			{
				path: "backend/README.md",
				content: `# ${projectName} Backend (Adonis.js)\n\nTypeScript-first Node.js backend.\n\n## Commands\n- Dev: \`npm run dev\`\n- Build: \`npm run build\`\n`,
			},
		];
	},
};
