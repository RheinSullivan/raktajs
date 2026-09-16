import type { ProjectConfig, ProjectFile } from "../types";
import type { BackendAdapter, BackendCapabilities } from "./backendAdapter";
import {
	buildJsOAuthConfigFile,
	buildOAuthEnvExample,
	getOAuthProviders,
	hasOAuth,
} from "./oauthSupport";

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
		const oauthProviders = getOAuthProviders(projectConfiguration);
		const hasOAuthEnabled = hasOAuth(projectConfiguration);

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

		const oauthHonoImport = hasOAuthEnabled
			? 'import { oauthConfig } from "./auth/oauth.config";\n'
			: "";

		const oauthHonoRoutes = hasOAuthEnabled
			? `
application.get("/api/auth/oauth/:provider/login", (context) => {
  const provider = context.req.param("provider") ?? "google";
  const upperProvider = provider.toUpperCase();
  const clientId = process.env[\`\${upperProvider}_CLIENT_ID\`] ?? "";
  const redirectUri =
    process.env[\`\${upperProvider}_REDIRECT_URI\`] ??
    oauthConfig.buildRedirectUri(provider);
  const authorizeEndpoint = oauthConfig.authorizeEndpoints[provider] ?? "";
  const scope = oauthConfig.scopes[provider] ?? "openid profile email";

  return context.redirect(
    \`\${authorizeEndpoint}?client_id=\${encodeURIComponent(clientId)}&redirect_uri=\${encodeURIComponent(redirectUri)}&response_type=code&scope=\${encodeURIComponent(scope)}\`,
  );
});

application.get("/api/auth/oauth/:provider/callback", (context) => {
  const provider = context.req.param("provider") ?? "google";
  const code = context.req.query("code") ?? "";
  return context.redirect(
    \`http://localhost:3000/auth/sign-in?oauth=\${provider}&code=\${encodeURIComponent(code)}\`,
  );
});
`
			: "";

		const indexContent = `${oauthHonoImport}import { Hono } from "hono";
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

application.get("/api/cms/posts", (context) => {
  return context.json([
    { id: "post_1", title: "Welcome to Rakta.js + Hono.js", published: true },
  ]);
});

application.post("/api/cms/posts", async (context) => {
  const body = await context.req.json().catch(() => ({}));
  return context.json({ id: \`post_\${Date.now()}\`, ...body, published: true }, 201);
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

${oauthHonoRoutes}
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
				path: "backend/.env.example",
				content: buildOAuthEnvExample(
					"PORT=4000\nNODE_ENV=development\n",
					oauthProviders,
				),
			},
			{
				path: "backend/README.md",
				content: `# ${projectName} Backend (Hono.js)\n\nWeb-standard multi-runtime JavaScript framework.\n\n## Commands\n- Dev: \`bun run dev\`\n- Start: \`bun run start\`\n`,
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
