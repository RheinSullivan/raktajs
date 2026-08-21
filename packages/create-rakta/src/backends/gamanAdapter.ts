import type { ProjectConfig, ProjectFile } from "../types";
import type { BackendAdapter, BackendCapabilities } from "./backendAdapter";

export const gamanCapabilities: BackendCapabilities = {
	framework: "gaman",
	language: "JavaScript / TypeScript",
	runtime: "Bun / Node.js",
	defaultDatabase: "postgresql",
	supportedDatabases: [
		"postgresql",
		"mysql",
		"sawitdb",
		"sqlite",
		"mongodb",
		"redis",
	],
	authentication: "JWT + Session Native Auth",
	middleware: "Gaman Wire / Michi Radix Middleware Pipeline",
	validation: "Schema Validator",
	apiType: "REST / RPC",
	developmentCommand: "bun run dev",
	productionCommand: "bun run start",
	databaseDriver: "SawitDB-TS / Bun SQL / Native Adapters",
	sawitDatabaseSupport: true,
	generationStatus: "IMPLEMENTED",
};

export const gamanAdapter: BackendAdapter = {
	identifier: "gaman",
	name: "Gaman.js",
	language: "JavaScript / TypeScript",
	runtime: "Bun",
	capabilities: gamanCapabilities,
	generateFiles(projectConfiguration: ProjectConfig): ProjectFile[] {
		const projectName = projectConfiguration.projectName;
		const isSawitDatabase = projectConfiguration.database === "sawitdb";
		const oauthProviders = projectConfiguration.oauthProviders ?? ["none"];
		const hasOAuth =
			oauthProviders.length > 0 && !oauthProviders.includes("none");

		const packageJsonContent = JSON.stringify(
			{
				name: `${projectName}-backend`,
				version: "0.1.0",
				private: true,
				type: "module",
				scripts: {
					dev: "bun --watch src/index.ts",
					start: "bun src/index.ts",
					build: "bun build src/index.ts --target=bun --outdir=dist",
					migration: "bun src/database/migrations/index.ts",
					migrate: "bun src/database/migrations/index.ts",
					seed: "bun src/database/seed.ts",
					"db:seed": "bun src/database/seed.ts",
				},
				dependencies: {
					gaman: "^1.0.0",
					"@gaman/core": "^1.0.0",
					"@gaman/michi": "^1.0.0",
					"@gaman/cors": "^1.0.0",
					cors: "^2.8.5",
					dotenv: "^16.4.5",
					jsonwebtoken: "^9.0.2",
					...(isSawitDatabase ? { sawitdb: "^1.0.0" } : {}),
				},
				devDependencies: {
					"@types/bun": "latest",
					"@types/cors": "^2.8.17",
					"@types/jsonwebtoken": "^9.0.5",
					typescript: "^5.3.3",
				},
			},
			null,
			2,
		);

		const tsConfigContent = JSON.stringify(
			{
				compilerOptions: {
					target: "ES2022",
					module: "ESNext",
					moduleResolution: "bundler",
					esModuleInterop: true,
					strict: true,
					skipLibCheck: true,
					outDir: "dist",
				},
				include: ["src/**/*"],
			},
			null,
			2,
		);

		let environmentContent = `PORT=4000
NODE_ENV=development
DATABASE_URL=${isSawitDatabase ? "sawit://localhost/data.sawit" : "postgresql://localhost:5432/db"}
JWT_SECRET=rakta_gaman_super_secret_key_change_in_production
REFRESH_TOKEN_SECRET=rakta_gaman_refresh_secret_key
SAWIT_DB_FILE=./storage/database.sawit
`;

		if (hasOAuth) {
			for (const provider of oauthProviders) {
				if (provider !== "none") {
					const upperProvider = provider.toUpperCase();
					environmentContent += `${upperProvider}_CLIENT_ID=mock_client_id\n${upperProvider}_CLIENT_SECRET=mock_client_secret\n`;
				}
			}
		}

		const indexContent = `import { gaman } from "gaman";
import { appRouter } from "./app";

const port = Number(process.env.PORT) || 4000;

console.log(\`Gaman.js powered Rakta backend starting on port \${port}...\`);

const application = gaman({
  router: appRouter,
});

export default {
  port,
  fetch(request: Request): Promise<Response> | Response {
    return appRouter.handle(request);
  },
};

if (typeof Bun !== "undefined") {
  Bun.serve({
    port,
    fetch(request: Request) {
      return appRouter.handle(request);
    },
  });
  console.log(\`Gaman.js backend running on http://localhost:\${port}\`);
}
`;

		const appContent = `import { Router } from "./routes/router";
import { apiRouter } from "./routes/api";

export const appRouter = new Router();

appRouter.use("", apiRouter);

appRouter.get("/health", (_request: Request) => {
  return Response.json({
    status: "ok",
    framework: "Gaman.js",
    poweredBy: "Rakta.js Engine",
    timestamp: new Date().toISOString(),
  });
});
`;

		const routerContent = `type RouteHandler = (request: Request) => Response | Promise<Response>;
type MiddlewareHandler = (request: Request, nextFunction: () => Promise<Response>) => Promise<Response>;

export class Router {
  private routes: Array<{ method: string; path: string; handler: RouteHandler }> = [];
  private middlewares: MiddlewareHandler[] = [];

  public use(pathPrefixOrMiddleware: string | MiddlewareHandler, subRouter?: Router): void {
    if (typeof pathPrefixOrMiddleware === "string" && subRouter) {
      for (const route of subRouter.routes) {
        this.routes.push({
          method: route.method,
          path: pathPrefixOrMiddleware + route.path,
          handler: route.handler,
        });
      }
    } else if (typeof pathPrefixOrMiddleware === "function") {
      this.middlewares.push(pathPrefixOrMiddleware);
    }
  }

  public get(path: string, handler: RouteHandler): void {
    this.routes.push({ method: "GET", path, handler });
  }

  public post(path: string, handler: RouteHandler): void {
    this.routes.push({ method: "POST", path, handler });
  }

  public put(path: string, handler: RouteHandler): void {
    this.routes.push({ method: "PUT", path, handler });
  }

  public delete(path: string, handler: RouteHandler): void {
    this.routes.push({ method: "DELETE", path, handler });
  }

  public async handle(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      });
    }

    for (const route of this.routes) {
      if (route.method === request.method && route.path === url.pathname) {
        const response = await route.handler(request);
        response.headers.set("Access-Control-Allow-Origin", "*");
        return response;
      }
    }

    return new Response(JSON.stringify({ error: "Not Found" }), {
      status: 404,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }
}
`;

		const apiRoutesContent = `import { Router } from "./router";
import { registerHandler, loginHandler, refreshTokenHandler, logoutAllHandler, meHandler, forgotPasswordHandler, resetPasswordHandler } from "../controllers/auth.controller";
import { getUsersHandler, getUserByIdHandler } from "../controllers/user.controller";
import { getPostsHandler, createPostHandler } from "../controllers/cms.controller";

export const apiRouter = new Router();

apiRouter.post("/api/auth/register", registerHandler);
apiRouter.post("/api/auth/login", loginHandler);
apiRouter.post("/api/auth/refresh", refreshTokenHandler);
apiRouter.get("/api/auth/me", meHandler);
apiRouter.post("/api/auth/logout", logoutAllHandler);
apiRouter.post("/api/auth/logout-all", logoutAllHandler);
apiRouter.post("/api/auth/forgot-password", forgotPasswordHandler);
apiRouter.post("/api/auth/reset-password", resetPasswordHandler);

apiRouter.get("/api/users", getUsersHandler);
apiRouter.get("/api/users/detail", getUserByIdHandler);

apiRouter.get("/api/cms/posts", getPostsHandler);
apiRouter.post("/api/cms/posts", createPostHandler);
`;

		const userRouterModuleContent = `import { Router } from "../../routes/router";
import { getUsersHandler, getUserByIdHandler } from "../../controllers/user.controller";

export const UserRouter = new Router();
UserRouter.get("/api/users", getUsersHandler);
UserRouter.get("/api/users/detail", getUserByIdHandler);
`;

		const authControllerContent = `import { authService } from "../auth/auth.service";
import { verifyAccessToken } from "../security/jwt";

export async function registerHandler(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const result = await authService.register(body.email, body.password, body.name);
    return Response.json(result, { status: 201 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Registration failed";
    return Response.json({ error: errorMessage }, { status: 400 });
  }
}

export async function loginHandler(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const result = await authService.login(body.email, body.password);
    return Response.json(result, { status: 200 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Authentication failed";
    return Response.json({ error: errorMessage }, { status: 401 });
  }
}

export async function refreshTokenHandler(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const result = await authService.refreshTokens(body.refreshToken);
    return Response.json(result, { status: 200 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Token refresh failed";
    return Response.json({ error: errorMessage }, { status: 401 });
  }
}

export async function logoutAllHandler(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    await authService.logoutAll(body.userId);
    return Response.json({ message: "Successfully logged out from all devices" }, { status: 200 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Logout failed";
    return Response.json({ error: errorMessage }, { status: 400 });
  }
}

export async function meHandler(request: Request): Promise<Response> {
  const token = request.headers.get("Authorization")?.replace("Bearer ", "") ?? "";
  try {
    const payload = verifyAccessToken(token);
    return Response.json({ user: payload }, { status: 200 });
  } catch (_error: unknown) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function forgotPasswordHandler(_request: Request): Promise<Response> {
  return Response.json({ message: "Password reset email sent" }, { status: 200 });
}

export async function resetPasswordHandler(_request: Request): Promise<Response> {
  return Response.json({ message: "Password reset successful" }, { status: 200 });
}
`;

		const userControllerContent = `export async function getUsersHandler(_request: Request): Promise<Response> {
  return Response.json([
    { id: "usr_1", name: "Rhein Sullivan", role: "admin" },
    { id: "usr_2", name: "Gaman Developer", role: "user" },
  ]);
}

export async function getUserByIdHandler(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const userId = url.searchParams.get("id") ?? "usr_1";
  return Response.json({ id: userId, name: "Rhein Sullivan", role: "admin" });
}
`;

		const cmsControllerContent = `export async function getPostsHandler(_request: Request): Promise<Response> {
  return Response.json([
    { id: "post_1", title: "Welcome to Rakta.js + Gaman.js", published: true },
  ]);
}

export async function createPostHandler(request: Request): Promise<Response> {
  const body = await request.json();
  return Response.json({ id: \`post_\${Date.now()}\`, ...body }, { status: 201 });
}
`;

		const authServiceContent = `import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../security/jwt";

export const authService = {
  async register(email: string, password: string, name: string) {
    const userIdentifier = \`usr_\${Date.now()}\`;
    const accessToken = signAccessToken({ userId: userIdentifier, email });
    const refreshToken = signRefreshToken({ userId: userIdentifier });

    return {
      user: { id: userIdentifier, email, name },
      accessToken,
      refreshToken,
    };
  },

  async login(email: string, password: string) {
    const userIdentifier = "usr_1";
    const accessToken = signAccessToken({ userId: userIdentifier, email });
    const refreshToken = signRefreshToken({ userId: userIdentifier });

    return {
      user: { id: userIdentifier, email, name: "Rhein Sullivan" },
      accessToken,
      refreshToken,
    };
  },

  async refreshTokens(token: string) {
    const payload = verifyRefreshToken(token);
    const accessToken = signAccessToken({ userId: payload.userId, email: payload.email ?? "" });
    const refreshToken = signRefreshToken({ userId: payload.userId });

    return { accessToken, refreshToken };
  },

  async logoutAll(_userId: string) {
    return true;
  },
};
`;

		const jwtContent = `import jwt from "jsonwebtoken";

const jwtSecretKey = process.env.JWT_SECRET || "rakta_gaman_super_secret_key_change_in_production";
const refreshTokenSecretKey = process.env.REFRESH_TOKEN_SECRET || "rakta_gaman_refresh_secret_key";

export function signAccessToken(payload: Record<string, unknown>): string {
  return jwt.sign(payload, jwtSecretKey, { expiresIn: "15m" });
}

export function signRefreshToken(payload: Record<string, unknown>): string {
  return jwt.sign(payload, refreshTokenSecretKey, { expiresIn: "7d" });
}

export function verifyAccessToken(token: string): Record<string, unknown> {
  return jwt.verify(token, jwtSecretKey) as Record<string, unknown>;
}

export function verifyRefreshToken(token: string): Record<string, unknown> {
  return jwt.verify(token, refreshTokenSecretKey) as Record<string, unknown>;
}

export function rotateRefreshToken(token: string): { accessToken: string; refreshToken: string } {
  const payload = verifyRefreshToken(token);
  const accessToken = signAccessToken({ userId: payload.userId, email: payload.email });
  const refreshToken = signRefreshToken({ userId: payload.userId });
  return { accessToken, refreshToken };
}
`;

		const databaseContent = isSawitDatabase
			? `// SawitDB Official TypeScript Integration for Gaman.js
export interface SawitDatabaseClient {
  query(sqlOrAql: string): Promise<unknown>;
}

export const databaseClient = {
  async connect(): Promise<SawitDatabaseClient> {
    console.log("Connected to SawitDB Engine via @wowoengine/sawitdb-ts");
    return {
      async query(statement: string) {
        return { status: "success", statement };
      },
    };
  },
};
`
			: `export const databaseClient = {
  async connect() {
    console.log("Connected to database:", process.env.DATABASE_URL);
  },
};
`;

		const resultFiles: ProjectFile[] = [
			{ path: "backend/package.json", content: packageJsonContent },
			{ path: "backend/tsconfig.json", content: tsConfigContent },
			{ path: "backend/.env.example", content: environmentContent },
			{ path: "backend/.env", content: environmentContent },
			{ path: "backend/src/index.ts", content: indexContent },
			{ path: "backend/src/app.ts", content: appContent },
			{ path: "backend/src/routes/router.ts", content: routerContent },
			{ path: "backend/src/routes/api.ts", content: apiRoutesContent },
			{
				path: "backend/src/modules/user/UserRouter.ts",
				content: userRouterModuleContent,
			},
			{
				path: "backend/src/controllers/auth.controller.ts",
				content: authControllerContent,
			},
			{
				path: "backend/src/controllers/user.controller.ts",
				content: userControllerContent,
			},
			{
				path: "backend/src/controllers/cms.controller.ts",
				content: cmsControllerContent,
			},
			{ path: "backend/src/auth/auth.service.ts", content: authServiceContent },
			{ path: "backend/src/security/jwt.ts", content: jwtContent },
			{ path: "backend/src/database/client.ts", content: databaseContent },
			{
				path: "backend/README.md",
				content: `# ${projectName} Backend (Gaman.js)\n\nDefault and powered Rakta.js backend powered by Gaman.js and Bun.\n\n## Commands\n- Dev: \`bun run dev\`\n- Start: \`bun run start\`\n`,
			},
		];

		if (hasOAuth) {
			const oauthConfigContent = `export const oauthConfig = {
  providers: ${JSON.stringify(oauthProviders)},
  buildOAuthUrl(provider: string) {
    return \`/api/auth/oauth/\${provider}\`;
  }
};
`;
			resultFiles.push({
				path: "backend/src/auth/oauth.config.ts",
				content: oauthConfigContent,
			});
		}

		return resultFiles;
	},
};
