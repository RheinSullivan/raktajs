import type {
	BackendFramework,
	CssFramework,
	Database,
	ProjectConfig,
	ProjectFile,
} from "./types";
import { BACKEND_DISPLAY, CSS_DISPLAY, DATABASE_DISPLAY } from "./types";

// ─── Root files ─────────────────────────────────────────────────────────────

function getRootFiles(projectConfig: ProjectConfig): ProjectFile[] {
	const { projectName, projectMode } = projectConfig;

	const workspaces =
		projectMode === "fullstack" ? ["frontend", "backend", "shared"] : [];

	return [
		{
			path: "package.json",
			content: JSON.stringify(
				{
					name: projectName,
					version: "0.1.0",
					private: true,
					...(projectMode === "fullstack" ? { workspaces } : {}),
					scripts:
						projectMode === "fullstack"
							? {
									"dev:frontend": "cd frontend && bun run dev",
									"dev:backend": "cd backend && bun run dev",
									"build:frontend": "cd frontend && bun run build",
									"build:backend": "cd backend && bun run build",
									build: "bun run build:frontend && bun run build:backend",
									start: "cd backend && bun run start",
									typecheck:
										"cd frontend && bun run typecheck && cd ../backend && bun run typecheck",
								}
							: {
									dev: "rakta dev",
									build: "rakta build",
									start: "rakta start",
									typecheck: "tsc --noEmit",
								},
					description: `${projectName} — built with Rakta.js`,
				},
				null,
				2,
			),
		},
		{
			path: "tsconfig.base.json",
			content: JSON.stringify(
				{
					compilerOptions: {
						target: "ESNext",
						module: "ESNext",
						moduleResolution: "Bundler",
						jsx: "react-jsx",
						lib: ["ESNext", "DOM", "DOM.Iterable"],
						strict: true,
						noUncheckedIndexedAccess: true,
						exactOptionalPropertyTypes: true,
						skipLibCheck: true,
						esModuleInterop: true,
						allowSyntheticDefaultImports: true,
						resolveJsonModule: true,
						verbatimModuleSyntax: true,
						isolatedModules: true,
					},
					exclude: ["node_modules", "dist", "**/dist/**"],
				},
				null,
				2,
			),
		},
		{
			path: "bunfig.toml",
			content: `[install]\nauto = "fallback"\nexact = false\nregistry = "https://registry.npmjs.org/"\n\n[run]\nbun = true\n`,
		},
		{
			path: ".npmrc",
			content: `registry=https://registry.npmjs.org/\nstrict-ssl=true\nfetch-retries=5\nfetch-retry-mintimeout=20000\nfetch-retry-maxtimeout=120000\n`,
		},
		{
			path: ".env.example",
			content: `NODE_ENV=development\n`,
		},
		{
			path: ".gitignore",
			content: `node_modules/\ndist/\n.env\n.env.*\n!.env.example\n.DS_Store\n*.log\n.rakta/\n`,
		},
		{
			path: "README.md",
			content: generateProjectReadme(projectConfig),
		},
	];
}

// ─── Frontend-only starter (ShrimpRun game) ─────────────────────────────────

function getFrontendOnlyFiles(projectConfig: ProjectConfig): ProjectFile[] {
	const { projectName, cssFramework } = projectConfig;
	const styleFileName =
		cssFramework === "sass" ? "globals.scss" : "globals.css";

	return [
		{
			path: "package.json",
			content: JSON.stringify(
				{
					name: projectName,
					version: "0.1.0",
					private: true,
					type: "module",
					scripts: {
						dev: "rakta dev",
						build: "rakta build",
						start: "rakta start",
						routes: "rakta routes",
						typecheck: "tsc --noEmit",
					},
					dependencies: {
						raktajs: "^0.1.2",
						react: "^19.2.7",
						"react-dom": "^19.2.7",
						...getCssDependencies(cssFramework),
					},
					devDependencies: {
						"@types/react": "^19.2.17",
						"@types/react-dom": "^19.2.3",
						typescript: "^6.0.3",
						...getCssDevDependencies(cssFramework),
					},
				},
				null,
				2,
			),
		},
		{
			path: "tsconfig.json",
			content: JSON.stringify(
				{
					extends: "./tsconfig.base.json",
					compilerOptions: {
						outDir: "./dist",
						rootDir: "./",
						types: ["react", "react-dom"],
					},
					include: [
						"rakta-env.d.ts",
						"app/**/*",
						"components/**/*",
						"styles/**/*",
						"rakta.config.ts",
					],
					exclude: ["node_modules", "dist"],
				},
				null,
				2,
			),
		},
		{
			path: "rakta-env.d.ts",
			content: generateFrontendOnlyRaktaEnv(),
		},
		{
			path: "rakta.config.ts",
			content: `import { defineRaktaConfig } from "raktajs";\n\nexport default defineRaktaConfig({\n  appName: "${projectName}",\n  render: {\n    defaultMode: "csr",\n    routes: {},\n  },\n});\n`,
		},
		{
			path: "app/layout.tsx",
			content: generateFrontendOnlyLayout(),
		},
		{
			path: "app/page.tsx",
			content: generateFrontendOnlyPage(projectName),
		},
		{
			path: "app/loading.tsx",
			content: generateFrontendOnlyLoading(),
		},
		{
			path: "app/error.tsx",
			content: generateFrontendOnlyError(),
		},
		{
			path: "app/notFound.tsx",
			content: generateFrontendOnlyNotFound(),
		},
		{
			path: "app/components/raktaShrimpMascot.tsx",
			content: generateShrimpMascotComponent(),
		},
		{
			path: "app/components/shrimpRunGame.tsx",
			content: generateShrimpRunGameComponent(),
		},
		{
			path: `styles/${styleFileName}`,
			content: getFrontendOnlyCssGlobals(cssFramework),
		},
		{
			path: "public/.gitkeep",
			content: "",
		},
	];
}

// ─── Fullstack frontend files ────────────────────────────────────────────────

function getFullstackFrontendFiles(
	projectConfig: ProjectConfig,
): ProjectFile[] {
	const { projectName, cssFramework } = projectConfig;
	const styleFileName =
		cssFramework === "sass" ? "globals.scss" : "globals.css";

	return [
		{
			path: "frontend/package.json",
			content: JSON.stringify(
				{
					name: `${projectName}-frontend`,
					version: "0.1.0",
					private: true,
					scripts: {
						dev: "rakta dev",
						build: "rakta build",
						start: "rakta start",
						routes: "rakta routes",
						"imports:generate": "rakta imports:generate",
						"rpc:types": "rakta rpc:types",
						typecheck: "tsc --noEmit",
					},
					dependencies: {
						rakta: "^0.1.0",
						react: "^19.2.7",
						"react-dom": "^19.2.7",
						...getCssDependencies(cssFramework),
					},
					devDependencies: {
						"@types/react": "^19.2.17",
						"@types/react-dom": "^19.2.3",
						typescript: "^6.0.3",
						...getCssDevDependencies(cssFramework),
					},
				},
				null,
				2,
			),
		},
		{
			path: "frontend/tsconfig.json",
			content: JSON.stringify(
				{
					extends: "../tsconfig.base.json",
					compilerOptions: {
						outDir: "./dist",
						rootDir: "./",
					},
					include: [
						"app/**/*",
						"components/**/*",
						"lib/**/*",
						"stores/**/*",
						"schemas/**/*",
						"rakta.config.ts",
					],
					exclude: ["node_modules", "dist"],
				},
				null,
				2,
			),
		},
		{
			path: "frontend/rakta.config.ts",
			content: `import { defineRaktaConfig } from "raktajs";\n\nexport default defineRaktaConfig({\n  appName: "${projectName}",\n  render: {\n    defaultMode: "csr",\n    routes: {\n      "/": "ssg",\n      "/about": "ssg",\n      "/blog": "csg",\n      "/blog/:slug": "csg",\n      "/dashboard": "csr"\n    }\n  }\n});\n`,
		},
		{
			path: "frontend/app/layout.tsx",
			content: `import React from "react";\nimport "../styles/${styleFileName}";\n\ninterface RootLayoutProps {\n  readonly children: React.ReactNode;\n}\n\nexport default function RootLayout({ children }: RootLayoutProps) {\n  return (\n    <html lang="en">\n      <body>{children}</body>\n    </html>\n  );\n}\n`,
		},
		{
			path: "frontend/app/page.tsx",
			content: generateFullstackHomePage(projectName),
		},
		{
			path: "frontend/app/about/page.tsx",
			content: `import React from "react";\n\nexport default function AboutPage() {\n  return (\n    <main className="page-shell">\n      <section className="hero-card">\n        <p className="eyebrow">ABOUT</p>\n        <h1>About ${projectName}</h1>\n        <p>This project is built with Rakta.js, React, Bun, and TypeScript.</p>\n        <a href="/">Back to home</a>\n      </section>\n    </main>\n  );\n}\n`,
		},
		{
			path: "frontend/app/blog/page.tsx",
			content: `import React from "react";\n\nconst BLOG_POSTS = [\n  { slug: "getting-started", title: "Getting started with Rakta.js" },\n  { slug: "file-based-routing", title: "File-based routing explained" },\n  { slug: "type-safe-rpc", title: "Type-safe API with CarubanWire" },\n];\n\nexport default function BlogPage() {\n  return (\n    <main className="page-shell">\n      <section className="hero-card">\n        <p className="eyebrow">BLOG</p>\n        <h1>Articles</h1>\n        <ul>\n          {BLOG_POSTS.map((post) => (\n            <li key={post.slug}>\n              <a href={\`/blog/\${post.slug}\`}>{post.title}</a>\n            </li>\n          ))}\n        </ul>\n      </section>\n    </main>\n  );\n}\n`,
		},
		{
			path: "frontend/app/blog/[slug]/page.tsx",
			content: `import React from "react";\n\ninterface BlogPostPageProps {\n  readonly params: {\n    readonly slug?: string;\n  };\n}\n\nexport default function BlogPostPage({ params }: BlogPostPageProps) {\n  const postTitle = params.slug?.replaceAll("-", " ") ?? "Article";\n\n  return (\n    <main className="page-shell">\n      <section className="hero-card">\n        <p className="eyebrow">BLOG POST</p>\n        <h1>{postTitle}</h1>\n        <p>Slug: <code>{params.slug}</code></p>\n        <a href="/blog">Back to blog</a>\n      </section>\n    </main>\n  );\n}\n`,
		},
		{
			path: "frontend/app/loading.tsx",
			content: `import React from "react";\n\nexport default function Loading() {\n  return (\n    <main className="page-shell">\n      <p>Loading...</p>\n    </main>\n  );\n}\n`,
		},
		{
			path: "frontend/app/error.tsx",
			content: `import React from "react";\n\ninterface ErrorPageProps {\n  readonly error: Error;\n  readonly reset: () => void;\n}\n\nexport default function ErrorPage({ error, reset }: ErrorPageProps) {\n  return (\n    <main className="page-shell">\n      <section className="hero-card">\n        <h1>Something went wrong</h1>\n        <p>{error.message}</p>\n        <button type="button" onClick={reset}>Try again</button>\n      </section>\n    </main>\n  );\n}\n`,
		},
		{
			path: "frontend/app/not-found.tsx",
			content: `import React from "react";\n\nexport default function NotFound() {\n  return (\n    <main className="page-shell">\n      <section className="hero-card">\n        <h1>404</h1>\n        <p>The page you are looking for does not exist.</p>\n        <a href="/">Return home</a>\n      </section>\n    </main>\n  );\n}\n`,
		},
		{
			path: "frontend/app/api/hello/route.ts",
			content: `export async function GET(request: Request): Promise<Response> {\n  const requestUrl = new URL(request.url);\n\n  return Response.json({\n    message: "Hello from Rakta.js API",\n    pathname: requestUrl.pathname,\n    timestamp: new Date().toISOString(),\n  });\n}\n\nexport async function POST(request: Request): Promise<Response> {\n  const requestBody = await request.json() as Record<string, unknown>;\n\n  return Response.json({\n    received: requestBody,\n    timestamp: new Date().toISOString(),\n  });\n}\n`,
		},
		{
			path: "frontend/lib/http.ts",
			content: `export const API_URL = process.env["API_URL"] ?? "http://localhost:4000";\n\nexport async function apiGet<TData>(path: string): Promise<TData> {\n  const response = await fetch(\`\${API_URL}\${path}\`);\n\n  if (!response.ok) {\n    throw new Error(\`Request failed with status \${response.status}\`);\n  }\n\n  return response.json() as Promise<TData>;\n}\n`,
		},
		{
			path: "frontend/lib/routes.ts",
			content: `export const ROUTES = {\n  home: "/",\n  about: "/about",\n  blog: "/blog",\n  blogPost: (slug: string) => \`/blog/\${slug}\`,\n  apiHello: "/api/hello",\n} as const;\n`,
		},
		{
			path: "frontend/lib/utils.ts",
			content: `export function cn(...classNames: Array<string | undefined | null | false>): string {\n  return classNames.filter(Boolean).join(" ");\n}\n\nexport function slugify(text: string): string {\n  return text\n    .toLowerCase()\n    .replace(/[^a-z0-9]+/g, "-")\n    .replace(/(^-|-$)/g, "");\n}\n`,
		},
		{
			path: "frontend/stores/counter.store.ts",
			content: `import { createRaktaStore } from "raktajs";\n\ninterface CounterState {\n  readonly count: number;\n  readonly increment: () => void;\n  readonly decrement: () => void;\n}\n\nexport const useCounterStore = createRaktaStore<CounterState>((setState, getState) => ({\n  count: 0,\n  increment: () => setState({ count: getState().count + 1 }),\n  decrement: () => setState({ count: getState().count - 1 }),\n}));\n`,
		},
		{
			path: "frontend/schemas/user.schema.ts",
			content: `import { object, string, number } from "raktajs";\n\nexport const userSchema = object({\n  name: string().min(1),\n  email: string().min(5),\n  age: number().min(0).max(120),\n});\n\nexport type UserSchema = typeof userSchema;\n`,
		},
		{
			path: `frontend/styles/${styleFileName}`,
			content: getCssGlobals(cssFramework),
		},
		{
			path: "frontend/public/.gitkeep",
			content: "",
		},
		{
			path: "frontend/components/ui/.gitkeep",
			content: "",
		},
		{
			path: "frontend/components/layout/.gitkeep",
			content: "",
		},
	];
}

// ─── Backend files ───────────────────────────────────────────────────────────

function getBackendFiles(projectConfig: ProjectConfig): ProjectFile[] {
	return [
		...getBackendCommonFiles(projectConfig),
		...getBackendFrameworkFiles(projectConfig.backendFramework, projectConfig),
	];
}

function getBackendCommonFiles(projectConfig: ProjectConfig): ProjectFile[] {
	return [
		{
			path: "backend/src/env.ts",
			content: `function optionalEnv(envKey: string, fallbackValue: string): string {\n  return process.env[envKey] ?? fallbackValue;\n}\n\nexport const env = {\n  port: Number(optionalEnv("PORT", "4000")),\n  nodeEnv: optionalEnv("NODE_ENV", "development"),\n  corsOrigin: optionalEnv("CORS_ORIGIN", "http://localhost:3000"),\n  databaseUrl: optionalEnv("DATABASE_URL", ""),\n} as const;\n`,
		},
		{
			path: "backend/src/config/app.config.ts",
			content: `import { env } from "../env";\n\nexport const appConfig = {\n  name: "${projectConfig.projectName} API",\n  version: "0.1.0",\n  port: env.port,\n  nodeEnv: env.nodeEnv,\n  corsOrigin: env.corsOrigin,\n  isDev: env.nodeEnv === "development",\n} as const;\n`,
		},
		{
			path: "backend/src/config/database.config.ts",
			content: getDatabaseConfig(projectConfig.database),
		},
		{
			path: "backend/src/database/client.ts",
			content: getDatabaseClient(projectConfig.database),
		},
		{
			path: "backend/src/controllers/hello.controller.ts",
			content: `export interface HelloResponse {\n  readonly success: boolean;\n  readonly message: string;\n  readonly framework: string;\n  readonly version: string;\n  readonly timestamp: string;\n}\n\nexport function helloController(): HelloResponse {\n  return {\n    success: true,\n    message: "Hello from ${projectConfig.projectName} API",\n    framework: "${BACKEND_DISPLAY[projectConfig.backendFramework]}",\n    version: "0.1.0",\n    timestamp: new Date().toISOString(),\n  };\n}\n`,
		},
		{
			path: "backend/.env.example",
			content: getDatabaseEnvExample(projectConfig.database),
		},
		{
			path: "backend/tsconfig.json",
			content: JSON.stringify(
				{
					extends: "../tsconfig.base.json",
					compilerOptions: {
						outDir: "./dist",
						rootDir: "./src",
						types: ["node", "bun"],
					},
					include: ["src/**/*"],
					exclude: ["node_modules", "dist"],
				},
				null,
				2,
			),
		},
		{
			path: "backend/src/database/schema/.gitkeep",
			content: "",
		},
	];
}

function getBackendFrameworkFiles(
	selectedFramework: BackendFramework,
	projectConfig: ProjectConfig,
): ProjectFile[] {
	switch (selectedFramework) {
		case "gaman":
			return getGamanFiles(projectConfig);
		case "express":
			return getExpressFiles(projectConfig);
		case "nest":
			return getNestFiles(projectConfig);
		case "adonis":
			return getAdonisFiles(projectConfig);
		default:
			return getGamanFiles(projectConfig);
	}
}

function getGamanFiles(projectConfig: ProjectConfig): ProjectFile[] {
	return [
		{
			path: "backend/package.json",
			content: getBackendPackageJson(projectConfig, {
				dependencies: { ...getDatabaseDependencies(projectConfig.database) },
				devDependencies: { "@types/bun": "^1.3.14" },
			}),
		},
		{
			path: "backend/src/app.ts",
			content: `import { appConfig } from "./config/app.config";\nimport { helloController } from "./controllers/hello.controller";\n\nconst corsHeaders = {\n  "Access-Control-Allow-Origin": appConfig.corsOrigin,\n  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",\n  "Access-Control-Allow-Headers": "Content-Type, Authorization",\n};\n\nconst server = Bun.serve({\n  port: appConfig.port,\n  fetch(request: Request): Response {\n    const requestUrl = new URL(request.url);\n\n    if (request.method === "OPTIONS") {\n      return new Response(null, { status: 204, headers: corsHeaders });\n    }\n\n    if (requestUrl.pathname === "/api/hello" && request.method === "GET") {\n      return Response.json(helloController(), { headers: corsHeaders });\n    }\n\n    return Response.json(\n      { success: false, error: "Not found" },\n      { status: 404, headers: corsHeaders }\n    );\n  },\n});\n\nconsole.log(\`[${projectConfig.projectName}] Backend running at http://localhost:\${server.port}\`);\n`,
		},
	];
}

function getExpressFiles(projectConfig: ProjectConfig): ProjectFile[] {
	return [
		{
			path: "backend/package.json",
			content: getBackendPackageJson(projectConfig, {
				dependencies: {
					express: "^4.19.2",
					cors: "^2.8.5",
					...getDatabaseDependencies(projectConfig.database),
				},
				devDependencies: {
					"@types/express": "^4.17.21",
					"@types/cors": "^2.8.17",
					"@types/node": "^26.0.1",
				},
			}),
		},
		{
			path: "backend/src/app.ts",
			content: `import cors from "cors";\nimport express from "express";\nimport { appConfig } from "./config/app.config";\nimport { helloController } from "./controllers/hello.controller";\n\nconst app = express();\n\napp.use(cors({ origin: appConfig.corsOrigin }));\napp.use(express.json());\n\napp.get("/api/hello", (_request, response) => {\n  response.json(helloController());\n});\n\napp.use((_request, response) => {\n  response.status(404).json({ success: false, error: "Not found" });\n});\n\napp.listen(appConfig.port, () => {\n  console.log(\`[${projectConfig.projectName}] Backend running at http://localhost:\${appConfig.port}\`);\n});\n`,
		},
		{
			path: "backend/src/middlewares/.gitkeep",
			content: "",
		},
		{
			path: "backend/src/routes/.gitkeep",
			content: "",
		},
		{
			path: "backend/src/services/.gitkeep",
			content: "",
		},
	];
}

function getNestFiles(projectConfig: ProjectConfig): ProjectFile[] {
	return [
		{
			path: "backend/package.json",
			content: getBackendPackageJson(projectConfig, {
				dependencies: {
					"@nestjs/common": "^10.3.0",
					"@nestjs/core": "^10.3.0",
					"@nestjs/platform-express": "^10.3.0",
					"reflect-metadata": "^0.2.2",
					...getDatabaseDependencies(projectConfig.database),
				},
				devDependencies: {
					"@types/node": "^26.0.1",
				},
			}),
		},
		{
			path: "backend/nest-cli.json",
			content: JSON.stringify(
				{
					$schema: "https://json.schemastore.org/nest-cli",
					collection: "@nestjs/schematics",
					sourceRoot: "src",
				},
				null,
				2,
			),
		},
		{
			path: "backend/src/app.module.ts",
			content: `import { Module } from "@nestjs/common";\nimport { AppController } from "./app.controller";\n\n@Module({\n  controllers: [AppController],\n})\nexport class AppModule {}\n`,
		},
		{
			path: "backend/src/app.controller.ts",
			content: `import { Controller, Get } from "@nestjs/common";\nimport { helloController } from "./controllers/hello.controller";\n\n@Controller("api")\nexport class AppController {\n  @Get("hello")\n  hello() {\n    return helloController();\n  }\n}\n`,
		},
		{
			path: "backend/src/main.ts",
			content: `import "reflect-metadata";\nimport { NestFactory } from "@nestjs/core";\nimport { AppModule } from "./app.module";\nimport { appConfig } from "./config/app.config";\n\nasync function bootstrap(): Promise<void> {\n  const app = await NestFactory.create(AppModule);\n  app.enableCors({ origin: appConfig.corsOrigin });\n  await app.listen(appConfig.port);\n  console.log(\`[${projectConfig.projectName}] Backend running at http://localhost:\${appConfig.port}\`);\n}\n\nbootstrap().catch(console.error);\n`,
		},
		{
			path: "backend/src/modules/.gitkeep",
			content: "",
		},
		{
			path: "backend/src/common/.gitkeep",
			content: "",
		},
	];
}

function getAdonisFiles(projectConfig: ProjectConfig): ProjectFile[] {
	return [
		{
			path: "backend/package.json",
			content: getBackendPackageJson(projectConfig, {
				dependencies: {
					"@adonisjs/core": "^6.9.0",
					...getDatabaseDependencies(projectConfig.database),
				},
				devDependencies: {
					"@adonisjs/assembler": "^7.7.0",
					"@types/node": "^26.0.1",
				},
			}),
		},
		{
			path: "backend/app/controllers/.gitkeep",
			content: "",
		},
		{
			path: "backend/app/middleware/.gitkeep",
			content: "",
		},
		{
			path: "backend/app/services/.gitkeep",
			content: "",
		},
		{
			path: "backend/start/.gitkeep",
			content: "",
		},
		{
			path: "backend/config/.gitkeep",
			content: "",
		},
		{
			path: "backend/src/app.ts",
			content: `import { appConfig } from "./config/app.config";\nimport { helloController } from "./controllers/hello.controller";\n\nconst corsHeaders = {\n  "Access-Control-Allow-Origin": appConfig.corsOrigin,\n  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",\n  "Access-Control-Allow-Headers": "Content-Type, Authorization",\n};\n\nconst server = Bun.serve({\n  port: appConfig.port,\n  fetch(request: Request): Response {\n    const requestUrl = new URL(request.url);\n\n    if (request.method === "OPTIONS") {\n      return new Response(null, { status: 204, headers: corsHeaders });\n    }\n\n    if (requestUrl.pathname === "/api/hello" && request.method === "GET") {\n      return Response.json(helloController(), { headers: corsHeaders });\n    }\n\n    return Response.json(\n      { success: false, error: "Not found" },\n      { status: 404, headers: corsHeaders }\n    );\n  },\n});\n\nconsole.log(\`[${projectConfig.projectName}] Backend running at http://localhost:\${server.port}\`);\n`,
		},
	];
}

function getBackendPackageJson(
	projectConfig: ProjectConfig,
	packageDeps: {
		readonly dependencies: Record<string, string>;
		readonly devDependencies: Record<string, string>;
	},
): string {
	return JSON.stringify(
		{
			name: `${projectConfig.projectName}-backend`,
			version: "0.1.0",
			private: true,
			type: "module",
			scripts: {
				dev: "bun run --watch src/app.ts",
				build: "bun build src/app.ts --outfile dist/app.js --target bun",
				start: "bun run dist/app.js",
				typecheck: "tsc --noEmit",
			},
			dependencies: {
				...packageDeps.dependencies,
			},
			devDependencies: {
				"@types/bun": "^1.3.14",
				typescript: "^6.0.3",
				...packageDeps.devDependencies,
			},
		},
		null,
		2,
	);
}

// ─── Shared files (fullstack only) ──────────────────────────────────────────

function getSharedFiles(projectConfig: ProjectConfig): ProjectFile[] {
	return [
		{
			path: "shared/types/index.ts",
			content: `export interface ApiResponse<TData = unknown> {\n  readonly success: boolean;\n  readonly data?: TData;\n  readonly error?: string;\n  readonly message?: string;\n}\n\nexport interface User {\n  readonly id: string;\n  readonly name: string;\n  readonly email: string;\n  readonly createdAt: string;\n  readonly updatedAt: string;\n}\n`,
		},
		{
			path: "shared/constants/index.ts",
			content: `export const APP_NAME = "${projectConfig.projectName}";\nexport const API_VERSION = "v1";\nexport const DEFAULT_PAGE_SIZE = 20;\n`,
		},
	];
}

// ─── CSS helpers ─────────────────────────────────────────────────────────────

function getCssDependencies(
	cssFramework: CssFramework,
): Record<string, string> {
	switch (cssFramework) {
		case "tailwind":
			return { tailwindcss: "^4.3.1" };
		case "bootstrap":
			return { bootstrap: "^5.3.3" };
		case "sass":
		case "none":
			return {};
	}
}

function getCssDevDependencies(
	cssFramework: CssFramework,
): Record<string, string> {
	switch (cssFramework) {
		case "sass":
			return { sass: "^1.77.0" };
		default:
			return {};
	}
}

function getFrontendOnlyCssGlobals(cssFramework: CssFramework): string {
	const cssImport =
		cssFramework === "tailwind"
			? `@import "tailwindcss";\n\n`
			: cssFramework === "bootstrap"
				? `@import url("https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css");\n\n`
				: cssFramework === "sass"
					? `$color-primary: #dc2626;\n$color-background: #050505;\n$color-foreground: #f8fafc;\n\n`
					: "";

	return `${cssImport}:root {
  --color-primary: #dc2626;
  --color-background: #050505;
  --color-foreground: #f8fafc;
  --color-surface: #0e111a;
  --color-border: rgba(255, 255, 255, 0.1);
  --color-muted: #94a3b8;
  color-scheme: dark;
}

html {
  scroll-behavior: smooth;
}

body {
  margin: 0;
  min-width: 320px;
  min-height: 100vh;
  color: var(--color-foreground);
  background: var(--color-background);
  font-family:
    ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
    Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

@keyframes shrimpLegs {
  0% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(2px);
  }
}
`;
}

function getCssGlobals(cssFramework: CssFramework): string {
	const sharedBase = `
:root {
  --color-primary: #dc2626;
  --color-background: #050505;
  --color-foreground: #f8fafc;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  color: var(--color-foreground);
  background: var(--color-background);
  font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.page-shell {
  width: min(100% - 2rem, 960px);
  margin: 0 auto;
  padding: 4rem 0;
}

.hero-card,
.feature-card {
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: #0e111a;
  border-radius: 24px;
  padding: 2rem;
  margin-bottom: 1.5rem;
}

.eyebrow {
  color: #dc2626;
  font-weight: 700;
  letter-spacing: 0.12em;
  font-size: 0.75rem;
  text-transform: uppercase;
}

.button-row {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-top: 1rem;
}

a {
  color: #dc2626;
}

button {
  cursor: pointer;
}
`;

	switch (cssFramework) {
		case "tailwind":
			return `@import "tailwindcss";\n${sharedBase}`;
		case "bootstrap":
			return `@import url("https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css");\n${sharedBase}`;
		case "sass":
			return `$color-primary: #dc2626;\n$color-background: #050505;\n$color-foreground: #f8fafc;\n${sharedBase}`;
		case "none":
			return sharedBase;
	}
}

// ─── Inline template generators ──────────────────────────────────────────────

function generateFrontendOnlyRaktaEnv(): string {
	return `declare module "*.css";
declare module "*.scss";
declare module "*.sass";

type RaktaClickAttributes = Omit<
  import("react").AnchorHTMLAttributes<HTMLAnchorElement>,
  "href"
> & {
  readonly to: string;
};

declare global {
  namespace JSX {
    interface IntrinsicElements {
      click: RaktaClickAttributes;
    }
  }

  const useCallback: typeof import("react").useCallback;
  const useEffect: typeof import("react").useEffect;
  const useRef: typeof import("react").useRef;
  const useState: typeof import("react").useState;

  const ShrimpRunGame: typeof import("./app/components/shrimpRunGame").default;
  const RaktaShrimpMascot: typeof import("./app/components/raktaShrimpMascot").default;
}

declare module "react/jsx-runtime" {
  namespace JSX {
    interface IntrinsicElements {
      click: RaktaClickAttributes;
    }
  }
}

declare module "react/jsx-dev-runtime" {
  namespace JSX {
    interface IntrinsicElements {
      click: RaktaClickAttributes;
    }
  }
}

export {};
`;
}

function generateFrontendOnlyLayout(): string {
	return `interface RootLayoutProps {
  readonly children: import("react").ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Rakta.js App</title>
      </head>
      <body className="min-h-screen bg-[#050505] text-slate-50 antialiased">
        {children}
      </body>
    </html>
  );
}
`;
}

function generateFrontendOnlyPage(projectName: string): string {
	return `export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 px-4 py-16 sm:px-6 lg:px-8">
      <section className="rounded-3xl border border-white/10 bg-[#0e111a] p-8 shadow-2xl shadow-red-950/20">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.3em] text-red-600">
          THE RED ROUTER FRAMEWORK
        </p>
        <h1 className="mb-3 text-4xl font-extrabold leading-tight text-white md:text-6xl">
          Welcome to ${projectName}
        </h1>
        <p className="max-w-2xl text-base leading-7 text-slate-400">
          Built with Rakta.js — Small in size. Fierce in speed. Alive in every route.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <click
            to="/offline"
            className="rounded-xl border border-red-500/40 px-4 py-2 text-sm font-semibold text-red-400 transition hover:border-red-400 hover:text-red-300"
          >
            Open offline page
          </click>
          <click
            to="/dashboard"
            className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            View dashboard
          </click>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-[#0e111a] p-8 shadow-2xl shadow-red-950/20">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.3em] text-red-600">
          SHRIMPRUN
        </p>
        <h2 className="mb-1 text-2xl font-bold text-white">Play ShrimpRun</h2>
        <p className="mb-6 text-sm leading-6 text-slate-400">
          Press Space or click the game area to jump. Avoid the red obstacles!
        </p>

        <ShrimpRunGame />
      </section>
    </main>
  );
}
`;
}

function generateFrontendOnlyLoading(): string {
	return `export default function Loading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#050505] px-4">
      <p className="text-sm font-medium text-slate-400">Loading...</p>
    </main>
  );
}
`;
}

function generateFrontendOnlyError(): string {
	return `interface ErrorPageProps {
  readonly error: Error;
  readonly reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-4 py-16">
      <section className="w-full rounded-3xl border border-white/10 bg-[#0e111a] p-8 shadow-2xl shadow-red-950/20">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.3em] text-red-600">
          ERROR
        </p>
        <h1 className="mb-3 text-3xl font-extrabold text-white">
          Something went wrong
        </h1>
        <p className="mb-6 wrap-break-word text-sm leading-6 text-slate-400">
          {error.message}
        </p>
        <button
          type="button"
          onClick={reset}
          className="rounded-lg bg-red-600 px-6 py-2 font-semibold text-white transition hover:bg-red-700 active:bg-red-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
        >
          Try again
        </button>
      </section>
    </main>
  );
}
`;
}

function generateFrontendOnlyNotFound(): string {
	return `export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-4 py-16">
      <section className="w-full rounded-3xl border border-white/10 bg-[#0e111a] p-8 shadow-2xl shadow-red-950/20">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.3em] text-red-600">
          404
        </p>
        <h1 className="mb-3 text-3xl font-extrabold text-white">
          Page not found
        </h1>
        <p className="mb-6 text-sm leading-6 text-slate-400">
          The page you are looking for does not exist.
        </p>
        <click
          to="/"
          className="font-semibold text-red-500 underline-offset-4 transition hover:text-red-400 hover:underline"
        >
          Return home
        </click>
      </section>
    </main>
  );
}
`;
}

function generateShrimpMascotComponent(): string {
	return `interface RaktaShrimpMascotProps {
  readonly isJumping: boolean;
  readonly isDead: boolean;
  readonly style?: import("react").CSSProperties;
}

/**
 * RaktaShrimpMascot — The animated shrimp hero of ShrimpRun.
 * Drawn entirely with inline SVG. No external assets required.
 */
export default function RaktaShrimpMascot({
  isJumping,
  isDead,
  style,
}: RaktaShrimpMascotProps) {
  const bodyColor = isDead ? "#6b7280" : "#dc2626";
  const eyeColor = isDead ? "#374151" : "#fff";
  const legAnimation =
    isJumping || isDead ? "none" : "shrimpLegs 0.3s steps(2) infinite";

  return (
    <svg
      viewBox="0 0 48 48"
      width="48"
      height="48"
      style={{ display: "block", ...style }}
      aria-label={
        isDead ? "dead shrimp" : isJumping ? "shrimp jumping" : "running shrimp"
      }
      role="img"
    >
      <style>{\`
        @keyframes shrimpLegs {
          0%  { transform: translateY(0); }
          50% { transform: translateY(2px); }
        }
      \`}</style>

      {/* Body */}
      <path
        d="M8 30 Q10 14 24 12 Q38 10 40 22 Q42 32 32 36 Q20 40 8 30Z"
        fill={bodyColor}
      />

      {/* Shell segments */}
      <path
        d="M12 28 Q16 20 24 18 Q30 17 34 22"
        stroke="#b91c1c"
        strokeWidth="1.5"
        fill="none"
        opacity={isDead ? 0.3 : 0.6}
      />
      <path
        d="M14 32 Q19 24 28 22 Q33 21 36 26"
        stroke="#b91c1c"
        strokeWidth="1.5"
        fill="none"
        opacity={isDead ? 0.3 : 0.6}
      />

      {/* Eye */}
      <circle cx="34" cy="18" r="4" fill="#1e293b" />
      <circle cx="35" cy="17" r="2" fill={eyeColor} />

      {isDead && (
        <>
          <line
            x1="32"
            y1="16"
            x2="36"
            y2="20"
            stroke="#374151"
            strokeWidth="1.5"
          />
          <line
            x1="36"
            y1="16"
            x2="32"
            y2="20"
            stroke="#374151"
            strokeWidth="1.5"
          />
        </>
      )}

      {/* Antennae */}
      <line
        x1="34"
        y1="14"
        x2="40"
        y2="6"
        stroke={bodyColor}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <line
        x1="32"
        y1="13"
        x2="36"
        y2="4"
        stroke={bodyColor}
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      {/* Tail */}
      <path
        d="M10 30 Q4 26 6 20"
        stroke={bodyColor}
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M10 30 Q2 30 4 36"
        stroke={bodyColor}
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M10 30 Q6 34 8 40"
        stroke={bodyColor}
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />

      {/* Legs */}
      <g
        style={{
          animation: legAnimation,
          transformOrigin: "24px 36px",
        }}
      >
        <line
          x1="18"
          y1="36"
          x2="14"
          y2="44"
          stroke={bodyColor}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <line
          x1="22"
          y1="38"
          x2="18"
          y2="46"
          stroke={bodyColor}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <line
          x1="26"
          y1="38"
          x2="24"
          y2="46"
          stroke={bodyColor}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <line
          x1="30"
          y1="37"
          x2="28"
          y2="45"
          stroke={bodyColor}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}
`;
}

function generateShrimpRunGameComponent(): string {
	return `// ─── Types ────────────────────────────────────────────────────────────────────

type GameStatus = "idle" | "running" | "dead";

interface ObstacleState {
  readonly id: number;
  readonly xPosition: number;
  readonly width: number;
  readonly height: number;
}

interface ShrimpState {
  readonly yPosition: number;
  readonly velocityY: number;
  readonly isJumping: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CANVAS_WIDTH = 640;
const CANVAS_HEIGHT = 160;
const GROUND_STRIP_HEIGHT = 4;
const SHRIMP_START_X = 60;
const SHRIMP_WIDTH = 48;
const SHRIMP_HEIGHT = 48;
const GRAVITY = 1.4;
const JUMP_VELOCITY = -18;
const INITIAL_OBSTACLE_SPEED = 5;
const SPEED_INCREMENT_PER_SCORE = 0.003;
const OBSTACLE_SPAWN_INTERVAL_MS = 1600;
const SCORE_TICK_MS = 80;
const COLLISION_MARGIN = 8;
const MAX_CONCURRENT_OBSTACLES = 3;
const FRAME_SKIP_THRESHOLD_MS = 100;

// ─── Physics helpers ──────────────────────────────────────────────────────────

function getObstacleSpeed(currentScore: number): number {
  return INITIAL_OBSTACLE_SPEED + currentScore * SPEED_INCREMENT_PER_SCORE;
}

function checkCollision(
  shrimpYPosition: number,
  obstacle: ObstacleState,
): boolean {
  const shrimpLeft = SHRIMP_START_X + COLLISION_MARGIN;
  const shrimpRight = SHRIMP_START_X + SHRIMP_WIDTH - COLLISION_MARGIN;
  const shrimpTop =
    CANVAS_HEIGHT -
    GROUND_STRIP_HEIGHT -
    shrimpYPosition -
    SHRIMP_HEIGHT +
    COLLISION_MARGIN;
  const shrimpBottom = CANVAS_HEIGHT - GROUND_STRIP_HEIGHT - shrimpYPosition;

  const obstacleLeft = obstacle.xPosition + COLLISION_MARGIN;
  const obstacleRight = obstacle.xPosition + obstacle.width - COLLISION_MARGIN;
  const obstacleTop = CANVAS_HEIGHT - GROUND_STRIP_HEIGHT - obstacle.height;
  const obstacleBottom = CANVAS_HEIGHT - GROUND_STRIP_HEIGHT;

  return (
    shrimpLeft < obstacleRight &&
    shrimpRight > obstacleLeft &&
    shrimpTop < obstacleBottom &&
    shrimpBottom > obstacleTop
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * ShrimpRun — Default Rakta.js interactive starter game.
 *
 * Like the Chrome offline Dino game, but the dinosaur is an animated shrimp.
 * Press Space or click the game canvas to jump. Avoid the red obstacles!
 *
 * Features:
 * - React state only — no external game library
 * - requestAnimationFrame game loop
 * - Physics: gravity + jump velocity
 * - Score that increases over time
 * - Speed ramps up as score grows
 * - Collision detection with margin
 * - High score tracked in component state
 * - Keyboard (Space) and click/tap support
 * - Accessible button game canvas
 * - SVG shrimp mascot — no external assets
 */
export default function ShrimpRunGame() {
  const [gameStatus, setGameStatus] = useState<GameStatus>("idle");
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [obstacles, setObstacles] = useState<ObstacleState[]>([]);
  const [shrimp, setShrimp] = useState<ShrimpState>({
    yPosition: 0,
    velocityY: 0,
    isJumping: false,
  });

  const gameStatusRef = useRef<GameStatus>("idle");
  const scoreRef = useRef(0);
  const shrimpRef = useRef<ShrimpState>({
    yPosition: 0,
    velocityY: 0,
    isJumping: false,
  });
  const obstaclesRef = useRef<ObstacleState[]>([]);
  const obstacleIdRef = useRef(0);
  const animationFrameRef = useRef<number>(0);
  const lastObstacleTimeRef = useRef(0);
  const lastScoreTickRef = useRef(0);

  const jump = useCallback((): void => {
    if (gameStatusRef.current === "dead") {
      return;
    }

    if (gameStatusRef.current === "idle") {
      gameStatusRef.current = "running";
      setGameStatus("running");
    }

    if (!shrimpRef.current.isJumping) {
      const nextShrimp: ShrimpState = {
        ...shrimpRef.current,
        velocityY: JUMP_VELOCITY,
        isJumping: true,
      };

      shrimpRef.current = nextShrimp;
      setShrimp(nextShrimp);
    }
  }, []);

  const resetGame = useCallback((): void => {
    const freshShrimp: ShrimpState = {
      yPosition: 0,
      velocityY: 0,
      isJumping: false,
    };

    shrimpRef.current = freshShrimp;
    obstaclesRef.current = [];
    obstacleIdRef.current = 0;
    scoreRef.current = 0;
    gameStatusRef.current = "idle";
    lastObstacleTimeRef.current = 0;
    lastScoreTickRef.current = 0;

    setShrimp(freshShrimp);
    setObstacles([]);
    setScore(0);
    setGameStatus("idle");
  }, []);

  useEffect(() => {
    let previousTimestamp = 0;

    function gameTick(timestamp: number): void {
      if (gameStatusRef.current !== "running") {
        animationFrameRef.current = requestAnimationFrame(gameTick);
        return;
      }

      const deltaTime = timestamp - previousTimestamp;
      previousTimestamp = timestamp;

      if (deltaTime > FRAME_SKIP_THRESHOLD_MS) {
        animationFrameRef.current = requestAnimationFrame(gameTick);
        return;
      }

      const currentShrimp = shrimpRef.current;
      let nextVelocityY = currentShrimp.velocityY + GRAVITY;
      let nextYPosition = currentShrimp.yPosition - nextVelocityY;

      if (nextYPosition <= 0) {
        nextYPosition = 0;
        nextVelocityY = 0;
      }

      const nextShrimp: ShrimpState = {
        yPosition: nextYPosition,
        velocityY: nextVelocityY,
        isJumping: nextYPosition > 0,
      };

      shrimpRef.current = nextShrimp;
      setShrimp(nextShrimp);

      const obstacleSpeed = getObstacleSpeed(scoreRef.current);

      const movedObstacles = obstaclesRef.current
        .map(
          (obstacle): ObstacleState => ({
            ...obstacle,
            xPosition: obstacle.xPosition - obstacleSpeed,
          }),
        )
        .filter((obstacle) => obstacle.xPosition + obstacle.width > -10);

      if (
        timestamp - lastObstacleTimeRef.current > OBSTACLE_SPAWN_INTERVAL_MS &&
        movedObstacles.length < MAX_CONCURRENT_OBSTACLES
      ) {
        const obstacleHeight = 30 + Math.floor(Math.random() * 30);
        const obstacleWidth = 20 + Math.floor(Math.random() * 20);

        movedObstacles.push({
          id: obstacleIdRef.current,
          xPosition: CANVAS_WIDTH + 20,
          width: obstacleWidth,
          height: obstacleHeight,
        });

        obstacleIdRef.current += 1;
        lastObstacleTimeRef.current = timestamp;
      }

      obstaclesRef.current = movedObstacles;
      setObstacles([...movedObstacles]);

      for (const obstacle of movedObstacles) {
        if (checkCollision(nextShrimp.yPosition, obstacle)) {
          gameStatusRef.current = "dead";
          setGameStatus("dead");
          setHighScore((previousHighScore: number) =>
            Math.max(previousHighScore, scoreRef.current),
          );
          animationFrameRef.current = requestAnimationFrame(gameTick);
          return;
        }
      }

      if (timestamp - lastScoreTickRef.current > SCORE_TICK_MS) {
        scoreRef.current += 1;
        setScore(scoreRef.current);
        lastScoreTickRef.current = timestamp;
      }

      animationFrameRef.current = requestAnimationFrame(gameTick);
    }

    animationFrameRef.current = requestAnimationFrame(gameTick);

    return () => {
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  useEffect(() => {
    function handleKeyDown(keyboardEvent: KeyboardEvent): void {
      if (keyboardEvent.code === "Space") {
        keyboardEvent.preventDefault();
        jump();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [jump]);

  const shrimpBottomOffset = GROUND_STRIP_HEIGHT + shrimp.yPosition;
  const isDead = gameStatus === "dead";
  const isIdle = gameStatus === "idle";
  const isRunning = gameStatus === "running";

  return (
    <div className="flex flex-col items-start gap-4 py-4">
      <div className="flex flex-wrap items-center gap-8">
        <span className="font-mono text-xl font-bold tabular-nums text-red-600">
          Score: {score}
        </span>
        {highScore > 0 && (
          <span className="text-sm text-slate-400">Best: {highScore}</span>
        )}
      </div>

      <button
        type="button"
        className="relative block max-w-full cursor-pointer select-none overflow-hidden rounded-2xl border-2 border-red-600/30 bg-[#0e111a] p-0 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
        aria-label="ShrimpRun game area. Click or press Space to jump."
        onClick={jump}
        onKeyDown={(keyboardEvent: import("react").KeyboardEvent) => {
          if (keyboardEvent.code === "Space") {
            keyboardEvent.preventDefault();
            jump();
          }
        }}
        style={{
          width: CANVAS_WIDTH,
          height: CANVAS_HEIGHT,
        }}
      >
        <span
          className="absolute bottom-0 left-0 w-full rounded-sm bg-red-600"
          style={{
            height: GROUND_STRIP_HEIGHT,
          }}
        />

        <span
          className="absolute"
          style={{
            left: SHRIMP_START_X,
            bottom: shrimpBottomOffset,
            width: SHRIMP_WIDTH,
            height: SHRIMP_HEIGHT,
          }}
        >
          <RaktaShrimpMascot isJumping={shrimp.isJumping} isDead={isDead} />
        </span>

        {obstacles.map((obstacle) => (
          <span
            key={obstacle.id}
            className="absolute rounded-t bg-red-600"
            style={{
              left: obstacle.xPosition,
              bottom: GROUND_STRIP_HEIGHT,
              width: obstacle.width,
              height: obstacle.height,
            }}
          />
        ))}

        {isIdle && (
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-slate-400">
            Press Space or click to start
          </span>
        )}

        {isDead && (
          <span className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/75">
            <span className="text-lg font-bold tracking-widest text-red-600">
              GAME OVER
            </span>
            <span className="text-sm text-slate-400">Score: {score}</span>
          </span>
        )}

        {isRunning && score > 0 && score % 50 === 0 && (
          <span className="absolute right-3 top-2 text-xs font-bold tracking-widest text-red-600 opacity-80">
            {score}!
          </span>
        )}
      </button>

      <p className="min-h-5 text-sm text-slate-400">
        {isIdle && "🦐 Click or press Space to make the shrimp jump!"}
        {isRunning && "🦐 Don't hit the obstacles!"}
        {isDead && "The shrimp got cooked. Try again!"}
      </p>

      {isDead && (
        <button
          type="button"
          className="w-fit rounded-lg bg-red-600 px-6 py-2 font-semibold text-white transition hover:bg-red-700 active:bg-red-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
          onClick={resetGame}
        >
          Restart
        </button>
      )}
    </div>
  );
}
`;
}

function generateFullstackHomePage(projectName: string): string {
	return `import React from "react";

export default function HomePage() {
  return (
    <main className="page-shell">
      <section className="hero-card">
        <p className="eyebrow">THE RED ROUTER FRAMEWORK</p>
        <h1>Welcome to ${projectName}</h1>
        <p>
          Built with Rakta.js — Small in size. Fierce in speed. Alive in every route.
        </p>
        <div className="button-row">
          <a href="/about">About</a>
          <a href="/blog">Blog</a>
        </div>
      </section>
    </main>
  );
}
`;
}

// ─── Database helpers ─────────────────────────────────────────────────────────

function getDatabaseDependencies(
	selectedDatabase: Database,
): Record<string, string> {
	switch (selectedDatabase) {
		case "postgresql":
			return { postgres: "^3.4.4" };
		case "mysql":
		case "mariadb":
			return { mysql2: "^3.9.8" };
		case "mongodb":
			return { mongodb: "^6.8.0" };
		case "firebase":
			return { "firebase-admin": "^12.7.0" };
		case "sqlite":
			return {};
		case "redis":
			return { ioredis: "^5.4.1" };
		case "planetscale":
			return { "@planetscale/database": "^1.18.0" };
		case "neon":
			return { "@neondatabase/serverless": "^0.9.4" };
		case "turso":
			return { "@libsql/client": "^0.6.2" };
		default:
			return {};
	}
}

function getDatabaseConfig(selectedDatabase: Database): string {
	switch (selectedDatabase) {
		case "sqlite":
			return `export const databaseConfig = {\n  path: process.env["DATABASE_PATH"] ?? "./database.sqlite",\n  provider: "sqlite" as const,\n} as const;\n`;
		case "firebase":
			return `export const databaseConfig = {\n  projectId: process.env["FIREBASE_PROJECT_ID"] ?? "",\n  clientEmail: process.env["FIREBASE_CLIENT_EMAIL"] ?? "",\n  privateKey: process.env["FIREBASE_PRIVATE_KEY"]?.replace(/\\\\\\\\n/g, "\\\\n") ?? "",\n  databaseUrl: process.env["FIREBASE_DATABASE_URL"] ?? "",\n  provider: "firebase" as const,\n} as const;\n`;
		case "turso":
			return `export const databaseConfig = {\n  url: process.env["TURSO_DATABASE_URL"] ?? "",\n  authToken: process.env["TURSO_AUTH_TOKEN"] ?? "",\n  provider: "turso" as const,\n} as const;\n`;
		default:
			return `import { env } from "../env";\n\nexport const databaseConfig = {\n  url: env.databaseUrl,\n  provider: "${selectedDatabase}" as const,\n} as const;\n`;
	}
}

function getDatabaseClient(selectedDatabase: Database): string {
	switch (selectedDatabase) {
		case "postgresql":
			return `import postgres from "postgres";\nimport { databaseConfig } from "../config/database.config";\n\nexport const sql = databaseConfig.url ? postgres(databaseConfig.url) : null;\n`;
		case "mysql":
		case "mariadb":
			return `import mysql from "mysql2/promise";\nimport { databaseConfig } from "../config/database.config";\n\nexport const pool = databaseConfig.url\n  ? mysql.createPool({ uri: databaseConfig.url, connectionLimit: 10 })\n  : null;\n`;
		case "mongodb":
			return `import { MongoClient } from "mongodb";\nimport { databaseConfig } from "../config/database.config";\n\nexport const mongoClient = databaseConfig.url\n  ? new MongoClient(databaseConfig.url)\n  : null;\n`;
		case "firebase":
			return `import { cert, getApps, initializeApp } from "firebase-admin/app";\nimport { getFirestore } from "firebase-admin/firestore";\nimport { databaseConfig } from "../config/database.config";\n\nconst credentialReady =\n  databaseConfig.projectId.length > 0 &&\n  databaseConfig.clientEmail.length > 0 &&\n  databaseConfig.privateKey.length > 0;\n\nexport const firebaseApp = getApps()[0] ?? initializeApp(\n  credentialReady\n    ? {\n        credential: cert({\n          projectId: databaseConfig.projectId,\n          clientEmail: databaseConfig.clientEmail,\n          privateKey: databaseConfig.privateKey,\n        }),\n        databaseURL: databaseConfig.databaseUrl || undefined,\n      }\n    : undefined\n);\n\nexport const firestore = getFirestore(firebaseApp);\n`;
		case "sqlite":
			return `import { Database } from "bun:sqlite";\nimport { databaseConfig } from "../config/database.config";\n\nexport const db = new Database(databaseConfig.path, { create: true });\n`;
		case "redis":
			return `import Redis from "ioredis";\nimport { databaseConfig } from "../config/database.config";\n\nexport const redis = databaseConfig.url ? new Redis(databaseConfig.url) : null;\n`;
		case "planetscale":
			return `import { connect } from "@planetscale/database";\nimport { databaseConfig } from "../config/database.config";\n\nexport const connection = databaseConfig.url\n  ? connect({ url: databaseConfig.url })\n  : null;\n`;
		case "neon":
			return `import { neon } from "@neondatabase/serverless";\nimport { databaseConfig } from "../config/database.config";\n\nexport const sql = databaseConfig.url ? neon(databaseConfig.url) : null;\n`;
		case "turso":
			return `import { createClient } from "@libsql/client";\nimport { databaseConfig } from "../config/database.config";\n\nexport const db =\n  databaseConfig.url && databaseConfig.authToken\n    ? createClient({ url: databaseConfig.url, authToken: databaseConfig.authToken })\n    : null;\n`;
		default:
			return `export const databaseClient = null;\n`;
	}
}

function getDatabaseEnvExample(selectedDatabase: Database): string {
	const baseEnv = `NODE_ENV=development\nPORT=4000\nCORS_ORIGIN=http://localhost:3000\n`;

	switch (selectedDatabase) {
		case "postgresql":
			return `${baseEnv}DATABASE_URL=postgresql://user:password@localhost:5432/dbname\n`;
		case "mysql":
			return `${baseEnv}DATABASE_URL=mysql://user:password@localhost:3306/dbname\n`;
		case "mariadb":
			return `${baseEnv}DATABASE_URL=mysql://user:password@localhost:3306/dbname\n`;
		case "mongodb":
			return `${baseEnv}DATABASE_URL=mongodb://localhost:27017/dbname\n`;
		case "firebase":
			return `${baseEnv}FIREBASE_PROJECT_ID=your-project-id\nFIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com\nFIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\nyour-key\\n-----END PRIVATE KEY-----\\n"\nFIREBASE_DATABASE_URL=https://your-project.firebaseio.com\n`;
		case "sqlite":
			return `${baseEnv}DATABASE_PATH=./database.sqlite\n`;
		case "redis":
			return `${baseEnv}DATABASE_URL=redis://localhost:6379\n`;
		case "planetscale":
			return `${baseEnv}DATABASE_URL=mysql://user:password@aws.connect.psdb.cloud/dbname\n`;
		case "neon":
			return `${baseEnv}DATABASE_URL=postgresql://user:password@ep-xxx.neon.tech/neondb?sslmode=require\n`;
		case "turso":
			return `${baseEnv}TURSO_DATABASE_URL=libsql://your-db.turso.io\nTURSO_AUTH_TOKEN=your-auth-token\n`;
		default:
			return `${baseEnv}DATABASE_URL=\n`;
	}
}

// ─── README ──────────────────────────────────────────────────────────────────

function generateProjectReadme(projectConfig: ProjectConfig): string {
	const { projectName, projectMode } = projectConfig;

	if (projectMode === "frontend-only") {
		return `# ${projectName}\n\nBuilt with Rakta.js — Small in size. Fierce in speed. Alive in every route.\n\n## Stack\n\n| Layer | Technology |\n| --- | --- |\n| Frontend | Rakta.js + React + TypeScript |\n| CSS | ${CSS_DISPLAY[projectConfig.cssFramework]} |\n| Runtime | Bun |\n\n## Run\n\n\`\`\`bash\nbun install\nbun run dev\n\`\`\`\n\n## ShrimpRun\n\nYour starter includes ShrimpRun — an interactive game where a shrimp dodges obstacles. Press Space or click to jump!\n`;
	}

	return `# ${projectName}\n\nBuilt with Rakta.js — Small in size. Fierce in speed. Alive in every route.\n\n## Stack\n\n| Layer | Technology |\n| --- | --- |\n| Frontend | Rakta.js + React + TypeScript |\n| CSS | ${CSS_DISPLAY[projectConfig.cssFramework]} |\n| Backend | ${BACKEND_DISPLAY[projectConfig.backendFramework]} |\n| Database | ${DATABASE_DISPLAY[projectConfig.database]} |\n| Runtime | Bun |\n\n## Run\n\n\`\`\`bash\nbun install\n\n# Terminal 1\nbun run dev:frontend\n\n# Terminal 2\nbun run dev:backend\n\`\`\`\n\n## Endpoints\n\n- Frontend: http://localhost:3000\n- Backend: http://localhost:4000\n`;
}

// ─── Main export ─────────────────────────────────────────────────────────────

export function generateProjectFiles(
	projectConfig: ProjectConfig,
): ProjectFile[] {
	if (projectConfig.projectMode === "frontend-only") {
		return [
			...getRootFiles(projectConfig),
			...getFrontendOnlyFiles(projectConfig),
		];
	}

	return [
		...getRootFiles(projectConfig),
		...getFullstackFrontendFiles(projectConfig),
		...getBackendFiles(projectConfig),
		...getSharedFiles(projectConfig),
	];
}
