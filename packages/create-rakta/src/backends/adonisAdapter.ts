import type { ProjectConfig, ProjectFile } from "../types";
import type { BackendAdapter, BackendCapabilities } from "./backendAdapter";
import {
	buildJsOAuthConfigFile,
	buildOAuthEnvExample,
	getOAuthProviders,
	hasOAuth,
} from "./oauthSupport";

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
		const oauthProviders = getOAuthProviders(projectConfiguration);
		const hasOAuthEnabled = hasOAuth(projectConfiguration);

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

		const oauthAdonisRoutes = hasOAuthEnabled
			? `
router.get("/api/auth/oauth/:provider/login", async (ctx) => {
  const provider = ctx.params.provider ?? "google";
  const upperProvider = provider.toUpperCase();
  const clientId = process.env[\`\${upperProvider}_CLIENT_ID\`] ?? "";
  const redirectUri =
    process.env[\`\${upperProvider}_REDIRECT_URI\`] ??
    \`\${process.env.OAUTH_REDIRECT_BASE_URL || "http://localhost:4000"}/api/auth/oauth/\${provider}/callback\`;
  const authorizeEndpoint =
    oauthConfig.authorizeEndpoints[provider] ?? "";
  const scope = oauthConfig.scopes[provider] ?? "openid profile email";

  return ctx.redirect(
    \`\${authorizeEndpoint}?client_id=\${encodeURIComponent(clientId)}&redirect_uri=\${encodeURIComponent(redirectUri)}&response_type=code&scope=\${encodeURIComponent(scope)}\`,
  );
});

router.get("/api/auth/oauth/:provider/callback", async (ctx) => {
  const provider = ctx.params.provider ?? "google";
  const code = ctx.request.qs("code") ?? "";
  return ctx.redirect(
    \`http://localhost:3000/auth/sign-in?oauth=\${provider}&code=\${encodeURIComponent(code)}\`,
  );
});
`
			: "";

		const routesContent = `import router from "@adonisjs/core/services/router";
${hasOAuthEnabled ? 'import { oauthConfig } from "../config/oauth";\n' : ""}
router.get("/health", async () => {
  return { status: "ok", framework: "Adonis.js" };
});

router.get("/api/users", async () => {
  return [
    { id: "usr_1", name: "Rhein Sullivan" },
    { id: "usr_2", name: "Adonis Developer" },
  ];
});

router.get("/api/cms/posts", async () => {
  return [
    { id: "post_1", title: "Welcome to Rakta.js + Adonis.js", published: true },
  ];
});

router.post("/api/cms/posts", async ({ request }) => {
  return {
    id: \`post_\${Date.now()}\`,
    ...(request.body() ?? {}),
    published: true,
  };
});
${oauthAdonisRoutes}`;

		return [
			{ path: "backend/package.json", content: packageJsonContent },
			{ path: "backend/bin/server.ts", content: serverContent },
			{ path: "backend/start/routes.ts", content: routesContent },
			{
				path: "backend/.env.example",
				content: buildOAuthEnvExample(
					"PORT=4000\nNODE_ENV=development\n",
					oauthProviders,
				),
			},
			{
				path: "backend/README.md",
				content: `# ${projectName} Backend (Adonis.js)\n\nTypeScript-first Node.js backend.\n\n## Commands\n- Dev: \`npm run dev\`\n- Build: \`npm run build\`\n`,
			},
			...(hasOAuthEnabled
				? [
						{
							path: "backend/config/oauth.ts",
							content: buildJsOAuthConfigFile(oauthProviders),
						},
					]
				: []),
		];
	},
};
