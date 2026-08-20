import type { ProjectConfig, ProjectFile } from "../types";
import type { BackendAdapter, BackendCapabilities } from "./backendAdapter";

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

@Module({
  controllers: [AppController],
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

		return [
			{ path: "backend/package.json", content: packageJsonContent },
			{ path: "backend/src/main.ts", content: mainContent },
			{ path: "backend/src/app.module.ts", content: appModuleContent },
			{ path: "backend/src/app.controller.ts", content: appControllerContent },
			{
				path: "backend/README.md",
				content: `# ${projectName} Backend (Nest.js)\n\nStructured Node.js backend.\n\n## Commands\n- Dev: \`npm run dev\`\n- Build: \`npm run build\`\n`,
			},
		];
	},
};
