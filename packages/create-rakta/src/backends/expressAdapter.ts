import type { ProjectConfig, ProjectFile } from "../types";
import type { BackendAdapter, BackendCapabilities } from "./backendAdapter";

export const expressCapabilities: BackendCapabilities = {
	framework: "express",
	language: "JavaScript / TypeScript",
	runtime: "Node.js",
	defaultDatabase: "postgresql",
	supportedDatabases: ["postgresql", "mysql", "sqlite", "mongodb", "sawitdb"],
	authentication: "Express middleware + JWT / express-session",
	middleware: "Express Middleware Function Pipeline",
	validation: "express-validator / zod",
	apiType: "REST",
	developmentCommand: "npm run dev",
	productionCommand: "node dist/index.js",
	databaseDriver: "pg / mysql2 / sawitdb",
	sawitDatabaseSupport: true,
	generationStatus: "IMPLEMENTED",
};

export const expressAdapter: BackendAdapter = {
	identifier: "express",
	name: "Express.js",
	language: "JavaScript / TypeScript",
	runtime: "Node.js",
	capabilities: expressCapabilities,
	generateFiles(projectConfiguration: ProjectConfig): ProjectFile[] {
		const projectName = projectConfiguration.projectName;
		const isSawitDatabase = projectConfiguration.database === "sawitdb";

		const packageJsonContent = JSON.stringify(
			{
				name: `${projectName}-backend`,
				version: "0.1.0",
				private: true,
				scripts: {
					dev: "tsx watch src/index.ts",
					build: "tsc",
					start: "node dist/index.js",
				},
				dependencies: {
					express: "^4.18.2",
					cors: "^2.8.5",
					dotenv: "^16.4.5",
					jsonwebtoken: "^9.0.2",
					...(isSawitDatabase ? { sawitdb: "^1.0.0" } : {}),
				},
				devDependencies: {
					"@types/express": "^4.17.21",
					"@types/cors": "^2.8.17",
					"@types/jsonwebtoken": "^9.0.5",
					"@types/node": "^20.11.0",
					tsx: "^4.7.0",
					typescript: "^5.3.3",
				},
			},
			null,
			2,
		);

		const indexContent = `import express, { Request, Response } from "express";
import cors from "cors";

const application = express();
const port = Number(process.env.PORT) || 4000;

application.use(cors({ origin: "http://localhost:3000" }));
application.use(express.json());

application.get("/health", (_request: Request, response: Response) => {
  response.json({ status: "ok", framework: "Express.js" });
});

application.get("/api/users", (_request: Request, response: Response) => {
  response.json([
    { id: "usr_1", name: "Rhein Sullivan" },
    { id: "usr_2", name: "Express Developer" },
  ]);
});

application.listen(port, () => {
  console.log(\`Express.js backend listening on http://localhost:\${port}\`);
});
`;

		return [
			{ path: "backend/package.json", content: packageJsonContent },
			{ path: "backend/src/index.ts", content: indexContent },
			{
				path: "backend/README.md",
				content: `# ${projectName} Backend (Express.js)\n\nMinimal Node.js backend.\n\n## Commands\n- Dev: \`npm run dev\`\n- Build: \`npm run build\`\n`,
			},
		];
	},
};
