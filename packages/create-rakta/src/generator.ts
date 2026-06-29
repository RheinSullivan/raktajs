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
			path: "tsconfig.json",
			content: JSON.stringify(
				{
					extends: "./tsconfig.base.json",
					compilerOptions: {
						outDir: "./dist",
						rootDir: "./",
					},
					include: [
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
			path: "rakta.config.ts",
			content: `import { defineRaktaConfig } from "rakta";\n\nexport default defineRaktaConfig({\n  appName: "${projectName}",\n  render: {\n    defaultMode: "csr",\n    routes: {}\n  }\n});\n`,
		},
		{
			path: "app/layout.tsx",
			content: generateFrontendOnlyLayout(cssFramework, styleFileName),
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
			path: "components/raktaShrimpMascot.tsx",
			content: generateShrimpMascotComponent(),
		},
		{
			path: "components/shrimpRunGame.tsx",
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
			content: `import { defineRaktaConfig } from "rakta";\n\nexport default defineRaktaConfig({\n  appName: "${projectName}",\n  render: {\n    defaultMode: "csr",\n    routes: {\n      "/": "ssg",\n      "/about": "ssg",\n      "/blog": "csg",\n      "/blog/:slug": "csg",\n      "/dashboard": "csr"\n    }\n  }\n});\n`,
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
			content: `import { createRaktaStore } from "rakta";\n\ninterface CounterState {\n  readonly count: number;\n  readonly increment: () => void;\n  readonly decrement: () => void;\n}\n\nexport const useCounterStore = createRaktaStore<CounterState>((setState, getState) => ({\n  count: 0,\n  increment: () => setState({ count: getState().count + 1 }),\n  decrement: () => setState({ count: getState().count - 1 }),\n}));\n`,
		},
		{
			path: "frontend/schemas/user.schema.ts",
			content: `import { object, string, number } from "rakta";\n\nexport const userSchema = object({\n  name: string().min(1),\n  email: string().min(5),\n  age: number().min(0).max(120),\n});\n\nexport type UserSchema = typeof userSchema;\n`,
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
	return `/* ShrimpRun — Rakta.js starter */\n${getCssGlobals(cssFramework)}\n\n/* ShrimpRun Game Styles */\n.shrimp-run-wrapper {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  gap: 1rem;\n  padding: 2rem 0;\n}\n\n.shrimp-run-canvas {\n  position: relative;\n  width: 640px;\n  max-width: 100%;\n  height: 160px;\n  background: #0e111a;\n  border-radius: 16px;\n  border: 2px solid rgba(220, 38, 38, 0.3);\n  overflow: hidden;\n  cursor: pointer;\n}\n\n.shrimp-run-ground {\n  position: absolute;\n  bottom: 0;\n  left: 0;\n  width: 100%;\n  height: 4px;\n  background: #dc2626;\n  border-radius: 2px;\n}\n\n.shrimp-run-score {\n  font-size: 1.5rem;\n  font-weight: 700;\n  color: #dc2626;\n  font-variant-numeric: tabular-nums;\n}\n\n.shrimp-run-message {\n  color: #94a3b8;\n  font-size: 0.875rem;\n}\n\n.shrimp-run-restart {\n  background: #dc2626;\n  color: white;\n  border: none;\n  border-radius: 8px;\n  padding: 0.5rem 1.5rem;\n  font-size: 1rem;\n  font-weight: 600;\n  cursor: pointer;\n  transition: background 0.15s;\n}\n\n.shrimp-run-restart:hover {\n  background: #b91c1c;\n}\n`;
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

function generateFrontendOnlyLayout(
	cssFramework: CssFramework,
	styleFileName: string,
): string {
	const cssImport =
		cssFramework !== "none" ? `import "../styles/${styleFileName}";\n` : "";

	return `import React from "react";
${cssImport}
interface RootLayoutProps {
  readonly children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Rakta.js App</title>
      </head>
      <body>{children}</body>
    </html>
  );
}
`;
}

function generateFrontendOnlyPage(projectName: string): string {
	return `import React from "react";
import ShrimpRunGame from "../components/shrimpRunGame";

export default function HomePage() {
  return (
    <main className="page-shell">
      <section className="hero-card">
        <p className="eyebrow">THE RED ROUTER FRAMEWORK</p>
        <h1>Welcome to ${projectName}</h1>
        <p>
          Built with Rakta.js — Small in size. Fierce in speed. Alive in every route.
        </p>
      </section>

      <section className="feature-card">
        <p className="eyebrow">SHRIMPRUN</p>
        <h2>Play ShrimpRun</h2>
        <p style={{ color: "#94a3b8", fontSize: "0.875rem" }}>
          Press Space or click the game area to jump. Avoid the obstacles!
        </p>
        <ShrimpRunGame />
      </section>
    </main>
  );
}
`;
}

function generateFrontendOnlyLoading(): string {
	return `import React from "react";

export default function Loading() {
  return (
    <main className="page-shell">
      <div style={{ textAlign: "center", padding: "4rem 0", color: "#94a3b8" }}>
        <p>Loading...</p>
      </div>
    </main>
  );
}
`;
}

function generateFrontendOnlyError(): string {
	return `import React from "react";

interface ErrorPageProps {
  readonly error: Error;
  readonly reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  return (
    <main className="page-shell">
      <section className="hero-card">
        <p className="eyebrow" style={{ color: "#dc2626" }}>ERROR</p>
        <h1>Something went wrong</h1>
        <p style={{ color: "#94a3b8" }}>{error.message}</p>
        <div className="button-row">
          <button
            type="button"
            onClick={reset}
            style={{
              background: "#dc2626",
              color: "white",
              border: "none",
              borderRadius: "8px",
              padding: "0.5rem 1.5rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </section>
    </main>
  );
}
`;
}

function generateFrontendOnlyNotFound(): string {
	return `import React from "react";

export default function NotFound() {
  return (
    <main className="page-shell">
      <section className="hero-card">
        <p className="eyebrow">404</p>
        <h1>Page not found</h1>
        <p style={{ color: "#94a3b8" }}>
          The page you are looking for does not exist.
        </p>
        <div className="button-row">
          <a href="/">Return home</a>
        </div>
      </section>
    </main>
  );
}
`;
}

function generateShrimpMascotComponent(): string {
	return `import React from "react";

interface RaktaShrimpMascotProps {
  readonly isJumping: boolean;
  readonly isDead: boolean;
  readonly style?: React.CSSProperties;
}

/**
 * RaktaShrimpMascot — The animated shrimp hero of ShrimpRun.
 * Drawn entirely with inline SVG, no external assets required.
 */
export default function RaktaShrimpMascot({
  isJumping,
  isDead,
  style,
}: RaktaShrimpMascotProps) {
  const bodyColor = isDead ? "#6b7280" : "#dc2626";
  const eyeColor = isDead ? "#374151" : "#fff";
  const legAnimation = isJumping || isDead ? "none" : "shrimpLegs 0.3s steps(2) infinite";

  return (
    <svg
      viewBox="0 0 48 48"
      width="48"
      height="48"
      style={{
        display: "block",
        ...style,
      }}
      aria-label={isDead ? "dead shrimp" : isJumping ? "shrimp jumping" : "running shrimp"}
      role="img"
    >
      <style>{
        \`@keyframes shrimpLegs {
          0%  { transform: translateY(0); }
          50% { transform: translateY(2px); }
        }\`
      }</style>

      {/* Body — curved shrimp shape */}
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
          <line x1="32" y1="16" x2="36" y2="20" stroke="#374151" strokeWidth="1.5" />
          <line x1="36" y1="16" x2="32" y2="20" stroke="#374151" strokeWidth="1.5" />
        </>
      )}

      {/* Antennae */}
      <line x1="34" y1="14" x2="40" y2="6" stroke={bodyColor} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="32" y1="13" x2="36" y2="4" stroke={bodyColor} strokeWidth="1.5" strokeLinecap="round" />

      {/* Tail fan */}
      <path d="M10 30 Q4 26 6 20" stroke={bodyColor} strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M10 30 Q2 30 4 36" stroke={bodyColor} strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M10 30 Q6 34 8 40" stroke={bodyColor} strokeWidth="2" fill="none" strokeLinecap="round" />

      {/* Legs with animation */}
      <g style={{ animation: legAnimation, transformOrigin: "24px 36px" }}>
        <line x1="18" y1="36" x2="14" y2="44" stroke={bodyColor} strokeWidth="1.5" strokeLinecap="round" />
        <line x1="22" y1="38" x2="18" y2="46" stroke={bodyColor} strokeWidth="1.5" strokeLinecap="round" />
        <line x1="26" y1="38" x2="24" y2="46" stroke={bodyColor} strokeWidth="1.5" strokeLinecap="round" />
        <line x1="30" y1="37" x2="28" y2="45" stroke={bodyColor} strokeWidth="1.5" strokeLinecap="round" />
      </g>
    </svg>
  );
}
`;
}

function generateShrimpRunGameComponent(): string {
	return `import React, { useState, useEffect, useRef, useCallback } from "react";
import RaktaShrimpMascot from "./raktaShrimpMascot";

// ─── Types ───────────────────────────────────────────────────────────────────

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

// ─── Constants ───────────────────────────────────────────────────────────────

const GROUND_Y = 100;
const SHRIMP_START_X = 60;
const SHRIMP_WIDTH = 48;
const SHRIMP_HEIGHT = 48;
const GRAVITY = 1.4;
const JUMP_VELOCITY = -18;
const INITIAL_OBSTACLE_SPEED = 5;
const SPEED_INCREMENT_PER_SCORE = 0.003;
const CANVAS_WIDTH = 640;
const CANVAS_HEIGHT = 160;
const OBSTACLE_SPAWN_INTERVAL_MS = 1600;
const SCORE_TICK_MS = 80;
const COLLISION_MARGIN = 8;

// ─── Helper ──────────────────────────────────────────────────────────────────

function getObstacleSpeed(currentScore: number): number {
  return INITIAL_OBSTACLE_SPEED + currentScore * SPEED_INCREMENT_PER_SCORE;
}

function checkCollision(
  shrimpY: number,
  obstacle: ObstacleState
): boolean {
  const shrimpLeft = SHRIMP_START_X + COLLISION_MARGIN;
  const shrimpRight = SHRIMP_START_X + SHRIMP_WIDTH - COLLISION_MARGIN;
  const shrimpTop = GROUND_Y - shrimpY - SHRIMP_HEIGHT + COLLISION_MARGIN;
  const shrimpBottom = GROUND_Y - shrimpY;

  const obstacleLeft = obstacle.xPosition + COLLISION_MARGIN;
  const obstacleRight = obstacle.xPosition + obstacle.width - COLLISION_MARGIN;
  const obstacleTop = CANVAS_HEIGHT - GROUND_Y_OFFSET - obstacle.height;
  const obstacleBottom = CANVAS_HEIGHT - GROUND_Y_OFFSET;

  return (
    shrimpLeft < obstacleRight &&
    shrimpRight > obstacleLeft &&
    shrimpTop < obstacleBottom &&
    shrimpBottom > obstacleTop
  );
}

// Ground offset from canvas bottom (ground strip height)
const GROUND_Y_OFFSET = 4;

// ─── Component ───────────────────────────────────────────────────────────────

/**
 * ShrimpRun — The default Rakta.js interactive starter game.
 *
 * Like the Chrome offline Dino game, but the dinosaur is a Rakta.js shrimp.
 * Press Space or click to jump. Avoid the red obstacles!
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

  const jump = useCallback(() => {
    if (gameStatusRef.current === "dead") return;

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

  const resetGame = useCallback(() => {
    const nextShrimp: ShrimpState = {
      yPosition: 0,
      velocityY: 0,
      isJumping: false,
    };

    shrimpRef.current = nextShrimp;
    obstaclesRef.current = [];
    obstacleIdRef.current = 0;
    scoreRef.current = 0;
    gameStatusRef.current = "idle";
    lastObstacleTimeRef.current = 0;
    lastScoreTickRef.current = 0;

    setShrimp(nextShrimp);
    setObstacles([]);
    setScore(0);
    setGameStatus("idle");
  }, []);

  // ── Game loop ──────────────────────────────────────────────────────────────

  useEffect(() => {
    let previousTimestamp = 0;

    function gameTick(timestamp: number): void {
      if (gameStatusRef.current !== "running") {
        animationFrameRef.current = requestAnimationFrame(gameTick);
        return;
      }

      const elapsed = timestamp - previousTimestamp;
      previousTimestamp = timestamp;

      if (elapsed > 100) {
        animationFrameRef.current = requestAnimationFrame(gameTick);
        return;
      }

      // Update shrimp physics
      const currentShrimp = shrimpRef.current;
      let nextVelocityY = currentShrimp.velocityY + GRAVITY;
      let nextYPosition = currentShrimp.yPosition - nextVelocityY;

      if (nextYPosition <= 0) {
        nextYPosition = 0;
        nextVelocityY = 0;
      }

      const nextIsJumping = nextYPosition > 0;
      const nextShrimp: ShrimpState = {
        yPosition: nextYPosition,
        velocityY: nextVelocityY,
        isJumping: nextIsJumping,
      };

      shrimpRef.current = nextShrimp;
      setShrimp(nextShrimp);

      // Update obstacles
      const currentSpeed = getObstacleSpeed(scoreRef.current);
      const nextObstacles = obstaclesRef.current
        .map((obstacle) => ({
          ...obstacle,
          xPosition: obstacle.xPosition - currentSpeed,
        }))
        .filter((obstacle) => obstacle.xPosition + obstacle.width > -10);

      // Spawn new obstacle
      if (
        timestamp - lastObstacleTimeRef.current > OBSTACLE_SPAWN_INTERVAL_MS &&
        nextObstacles.length < 3
      ) {
        const obstacleHeight = 30 + Math.floor(Math.random() * 30);
        const obstacleWidth = 20 + Math.floor(Math.random() * 20);

        nextObstacles.push({
          id: obstacleIdRef.current++,
          xPosition: CANVAS_WIDTH + 20,
          width: obstacleWidth,
          height: obstacleHeight,
        });

        lastObstacleTimeRef.current = timestamp;
      }

      obstaclesRef.current = nextObstacles;
      setObstacles([...nextObstacles]);

      // Collision detection
      for (const obstacle of nextObstacles) {
        if (checkCollision(nextShrimp.yPosition, obstacle)) {
          gameStatusRef.current = "dead";
          setGameStatus("dead");
          setHighScore((previousHigh) =>
            Math.max(previousHigh, scoreRef.current)
          );
          animationFrameRef.current = requestAnimationFrame(gameTick);
          return;
        }
      }

      // Score tick
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

  // ── Keyboard handler ───────────────────────────────────────────────────────

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

  // ── Derived values ─────────────────────────────────────────────────────────

  const shrimpBottomPx = GROUND_Y_OFFSET + shrimp.yPosition;
  const isDead = gameStatus === "dead";
  const isIdle = gameStatus === "idle";

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="shrimp-run-wrapper">
      {/* Score row */}
      <div style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
        <span className="shrimp-run-score">Score: {score}</span>
        {highScore > 0 && (
          <span style={{ color: "#94a3b8", fontSize: "0.875rem" }}>
            Best: {highScore}
          </span>
        )}
      </div>

      {/* Game canvas */}
      <div
        className="shrimp-run-canvas"
        role="button"
        tabIndex={0}
        aria-label="ShrimpRun game area. Click or press Space to jump."
        onClick={jump}
        onKeyDown={(keyboardEvent) => {
          if (keyboardEvent.code === "Space") {
            keyboardEvent.preventDefault();
            jump();
          }
        }}
        style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}
      >
        {/* Ground strip */}
        <div className="shrimp-run-ground" />

        {/* Shrimp */}
        <div
          style={{
            position: "absolute",
            left: SHRIMP_START_X,
            bottom: shrimpBottomPx,
            width: SHRIMP_WIDTH,
            height: SHRIMP_HEIGHT,
          }}
        >
          <RaktaShrimpMascot
            isJumping={shrimp.isJumping}
            isDead={isDead}
          />
        </div>

        {/* Obstacles */}
        {obstacles.map((obstacle) => (
          <div
            key={obstacle.id}
            style={{
              position: "absolute",
              left: obstacle.xPosition,
              bottom: GROUND_Y_OFFSET,
              width: obstacle.width,
              height: obstacle.height,
              background: "#dc2626",
              borderRadius: "4px 4px 0 0",
            }}
          />
        ))}

        {/* Idle overlay */}
        {isIdle && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#94a3b8",
              fontSize: "0.875rem",
              pointerEvents: "none",
            }}
          >
            Press Space or click to start
          </div>
        )}

        {/* Dead overlay */}
        {isDead && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.75rem",
              background: "rgba(5, 5, 5, 0.7)",
            }}
          >
            <span style={{ color: "#dc2626", fontWeight: 700, fontSize: "1.125rem" }}>
              GAME OVER
            </span>
            <span style={{ color: "#94a3b8", fontSize: "0.875rem" }}>
              Score: {score}
            </span>
          </div>
        )}
      </div>

      {/* Status message */}
      <p className="shrimp-run-message">
        {isIdle && "🦐 Tap or press Space to make the shrimp jump!"}
        {gameStatus === "running" && "🦐 Don't hit the obstacles!"}
        {isDead && "The shrimp got cooked. Try again!"}
      </p>

      {/* Restart button */}
      {isDead && (
        <button
          type="button"
          className="shrimp-run-restart"
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
