import type { ProjectConfig, ProjectFile } from "../types";
import type { BackendAdapter, BackendCapabilities } from "./backendAdapter";
import {
	buildJsOAuthConfigFile,
	buildOAuthEnvExample,
	getOAuthProviders,
	hasOAuth,
} from "./oauthSupport";

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
		const oauthProviders = getOAuthProviders(projectConfiguration);
		const hasOAuthEnabled = hasOAuth(projectConfiguration);

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

		const oauthImportLine = hasOAuthEnabled
			? 'import { oauthConfig } from "./auth/oauth.config";\n\n'
			: "";

		const oauthInlineRoutes = hasOAuthEnabled
			? `
// OAuth provider login and callback endpoints
application.get("/api/auth/oauth/:provider/login", (req: Request, res: Response) => {
  const provider = (req.params as Record<string, string>).provider ?? "google";
  const upperProvider = provider.toUpperCase();
  const clientId = process.env[\`\${upperProvider}_CLIENT_ID\`] ?? "";
  const redirectUri =
    process.env[\`\${upperProvider}_REDIRECT_URI\`] ??
    oauthConfig.buildRedirectUri(provider);
  const authorizeEndpoint = oauthConfig.authorizeEndpoints[provider] ?? "";
  const scope = oauthConfig.scopes[provider] ?? "openid profile email";

  res.redirect(
    \`\${authorizeEndpoint}?client_id=\${encodeURIComponent(clientId)}&redirect_uri=\${encodeURIComponent(redirectUri)}&response_type=code&scope=\${encodeURIComponent(scope)}\`,
  );
});

application.get("/api/auth/oauth/:provider/callback", (req: Request, res: Response) => {
  const provider = (req.params as Record<string, string>).provider ?? "google";
  const code = req.query.code ?? "";
  res.redirect(
    \`http://localhost:3000/auth/sign-in?oauth=\${provider}&code=\${encodeURIComponent(String(code))}\`,
  );
});
`
			: "";

		const indexContent = `${oauthImportLine}import express, { Request, Response } from "express";
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

application.get("/api/cms/posts", (_request: Request, response: Response) => {
  response.json([
    { id: "post_1", title: "Welcome to Rakta.js + Express.js", published: true },
  ]);
});

application.post("/api/cms/posts", (request: Request, response: Response) => {
  response.status(201).json({ id: \`post_\${Date.now()}\`, ...(request.body ?? {}) });
});
${oauthInlineRoutes}
application.listen(port, () => {
  console.log(\`Express.js backend listening on http://localhost:\${port}\`);
});
`;

		return [
			{ path: "backend/package.json", content: packageJsonContent },
			{ path: "backend/src/index.ts", content: indexContent },
			{
				path: "backend/.env.example",
				content: buildOAuthEnvExample(
					"PORT=4000\nNODE_ENV=development\n",
					oauthProviders,
				),
			},
			{
				path: "backend/README.md",
				content: `# ${projectName} Backend (Express.js)\n\nMinimal Node.js backend.\n\n## Commands\n- Dev: \`npm run dev\`\n- Build: \`npm run build\`\n`,
			},
			...(hasOAuthEnabled
				? [
						{
							path: "backend/src/auth/oauth.config.ts",
							content: buildJsOAuthConfigFile(oauthProviders),
						},
					]
				: []),
		];
	},
};
