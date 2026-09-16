import type { ProjectConfig, ProjectFile } from "../types";
import type { BackendAdapter, BackendCapabilities } from "./backendAdapter";
import {
	buildJsOAuthConfigFile,
	buildOAuthEnvExample,
	getOAuthProviders,
	hasOAuth,
} from "./oauthSupport";

export const nestjsCapabilities: BackendCapabilities = {
	framework: "nestjs",
	language: "JavaScript / TypeScript",
	runtime: "Node.js",
	defaultDatabase: "postgresql",
	supportedDatabases: ["postgresql", "mysql", "sqlite", "mongodb"],
	authentication: "Passport.js / JWT Guards",
	middleware: "Nest.js NestMiddleware / Interceptors",
	validation: "class-validator / class-transformer",
	apiType: "REST / GraphQL",
	developmentCommand: "nest start --watch",
	productionCommand: "node dist/main",
	databaseDriver: "TypeORM / Prisma",
	sawitDatabaseSupport: false,
	generationStatus: "IMPLEMENTED",
};

export const nestjsAdapter: BackendAdapter = {
	identifier: "nestjs",
	name: "Nest.js",
	language: "JavaScript / TypeScript",
	runtime: "Node.js",
	capabilities: nestjsCapabilities,
	generateFiles(projectConfiguration: ProjectConfig): ProjectFile[] {
		const projectName = projectConfiguration.projectName;
		const oauthProviders = getOAuthProviders(projectConfiguration);
		const hasOAuthEnabled = hasOAuth(projectConfiguration);

		const packageJsonContent = JSON.stringify(
			{
				name: `${projectName}-backend`,
				version: "0.1.0",
				private: true,
				scripts: {
					build: "nest build",
					start: "nest start",
					dev: "nest start --watch",
					typecheck: "tsc --noEmit",
				},
				dependencies: {
					"@nestjs/common": "^10.3.0",
					"@nestjs/core": "^10.3.0",
					"@nestjs/platform-express": "^10.3.0",
					"reflect-metadata": "^0.2.1",
					rxjs: "^7.8.1",
				},
				devDependencies: {
					"@nestjs/cli": "^10.3.0",
					"@types/node": "^20.11.0",
					typescript: "^5.3.3",
				},
			},
			null,
			2,
		);

		const mainContent = `import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap(): Promise<void> {
  const application = await NestFactory.create(AppModule);
  application.enableCors({ origin: "http://localhost:3000" });
  await application.listen(4000);
  console.log("Nest.js backend running on http://localhost:4000");
}

bootstrap();
`;

		const appModuleContent = `import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { CmsController } from "./cms.controller";
${hasOAuthEnabled ? 'import { OAuthController } from "./oauth.controller";\n' : ""}
@Module({
  controllers: [AppController, CmsController${hasOAuthEnabled ? ", OAuthController" : ""}],
  providers: [],
})
export class AppModule {}
`;

		const appControllerContent = `import { Controller, Get } from "@nestjs/common";

@Controller()
export class AppController {
  @Get("health")
  getHealth(): { status: string; framework: string } {
    return { status: "ok", framework: "Nest.js" };
  }

  @Get("api/users")
  getUsers(): Array<{ id: string; name: string }> {
    return [
      { id: "usr_1", name: "Rhein Sullivan" },
      { id: "usr_2", name: "Nest Developer" },
    ];
  }
}
`;

		const cmsControllerContent = `import { Body, Controller, Get, Post } from "@nestjs/common";

interface CmsPost {
  id: string;
  title: string;
  published: boolean;
}

@Controller("api/cms/posts")
export class CmsController {
  private readonly seededPosts: CmsPost[] = [
    { id: "post_1", title: "Welcome to Rakta.js + Nest.js", published: true },
    { id: "post_2", title: "Building CMS routes with decorators", published: true },
  ];

  @Get()
  getPosts(): CmsPost[] {
    return this.seededPosts;
  }

  @Post()
  createPost(@Body() body: Partial<CmsPost>): CmsPost {
    return { id: \`post_\${Date.now()}\`, title: body.title ?? "Untitled", published: true };
  }
}
`;

		const oauthControllerContent = `import { Controller, Get, Param, Query, Redirect } from "@nestjs/common";
import { oauthConfig } from "./auth/oauth.config";

@Controller()
export class OAuthController {
  @Get("api/auth/oauth/:provider/login")
  @Redirect()
  redirectToProvider(@Param("provider") provider: string): { url: string; statusCode: number } {
    const upperProvider = provider.toUpperCase();
    const clientId = process.env[\`\${upperProvider}_CLIENT_ID\`] ?? "";
    const redirectUri =
      process.env[\`\${upperProvider}_REDIRECT_URI\`] ??
      oauthConfig.buildRedirectUri(provider);
    const authorizeEndpoint = oauthConfig.authorizeEndpoints[provider] ?? "";
    const scope = oauthConfig.scopes[provider] ?? "openid profile email";

    return {
      url: \`\${authorizeEndpoint}?client_id=\${encodeURIComponent(clientId)}&redirect_uri=\${encodeURIComponent(redirectUri)}&response_type=code&scope=\${encodeURIComponent(scope)}\`,
      statusCode: 302,
    };
  }

  @Get("api/auth/oauth/:provider/callback")
  @Redirect()
  callback(@Param("provider") provider: string, @Query("code") code: string): { url: string; statusCode: number } {
    return {
      url: \`http://localhost:3000/auth/sign-in?oauth=\${provider}&code=\${encodeURIComponent(code ?? "")}\`,
      statusCode: 302,
    };
  }
}
`;

		const resultFiles: ProjectFile[] = [
			{ path: "backend/package.json", content: packageJsonContent },
			{ path: "backend/src/main.ts", content: mainContent },
			{ path: "backend/src/app.module.ts", content: appModuleContent },
			{ path: "backend/src/app.controller.ts", content: appControllerContent },
			{ path: "backend/src/cms.controller.ts", content: cmsControllerContent },
			{
				path: "backend/.env.example",
				content: buildOAuthEnvExample(
					"PORT=4000\nNODE_ENV=development\n",
					oauthProviders,
				),
			},
			{
				path: "backend/README.md",
				content: `# ${projectName} Backend (Nest.js)\n\nStructured Node.js backend.\n\n## Commands\n- Dev: \`npm run dev\`\n- Build: \`npm run build\`\n`,
			},
		];

		if (hasOAuthEnabled) {
			resultFiles.push(
				{
					path: "backend/src/auth/oauth.config.ts",
					content: buildJsOAuthConfigFile(oauthProviders),
				},
				{
					path: "backend/src/oauth.controller.ts",
					content: oauthControllerContent,
				},
			);
		}

		return resultFiles;
	},
};
