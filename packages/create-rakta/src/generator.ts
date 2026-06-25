import type { BackendFramework, CssFramework, Database, ProjectConfig, ProjectFile } from "./types";
import { BACKEND_DISPLAY, CSS_DISPLAY, DATABASE_DISPLAY } from "./types";

function getRootFiles(config: ProjectConfig): ProjectFile[] {
  const { projectName } = config;

  return [
    {
      path: "package.json",
      content: JSON.stringify(
        {
          name: projectName,
          version: "0.1.0",
          private: true,
          workspaces: ["frontend", "backend"],
          scripts: {
            "dev:frontend": "cd frontend && bun run dev",
            "dev:backend": "cd backend && bun run dev",
            "build:frontend": "cd frontend && bun run build",
            "build:backend": "cd backend && bun run build",
            build: "bun run build:frontend && bun run build:backend",
            start: "cd backend && bun run start",
            typecheck: "cd frontend && bun run typecheck && cd ../backend && bun run typecheck"
          },
          description: `${projectName} — built with Rakta.js`
        },
        null,
        2
      )
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
            skipLibCheck: true,
            esModuleInterop: true,
            allowSyntheticDefaultImports: true,
            resolveJsonModule: true,
            verbatimModuleSyntax: true,
            isolatedModules: true,
            ignoreDeprecations: "6.0"
          },
          exclude: ["node_modules", "dist", "**/dist/**"]
        },
        null,
        2
      )
    },
    {
      path: "bunfig.toml",
      content: `[install]
auto = "fallback"
exact = false
registry = "https://registry.npmjs.org/"

[run]
bun = true
`
    },
    {
      path: ".npmrc",
      content: `registry=https://registry.npmjs.org/
strict-ssl=true
fetch-retries=5
fetch-retry-mintimeout=20000
fetch-retry-maxtimeout=120000
`
    },
    {
      path: ".env.example",
      content: `NODE_ENV=development
`
    },
    {
      path: "README.md",
      content: generateProjectReadme(config)
    }
  ];
}

function getFrontendFiles(config: ProjectConfig): ProjectFile[] {
  const { projectName, cssFramework } = config;
  const styleFileName = cssFramework === "sass" ? "globals.scss" : "globals.css";

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
            typecheck: "tsc --noEmit"
          },
          dependencies: {
            rakta: "^0.1.0",
            react: "^18.3.0",
            "react-dom": "^18.3.0",
            ...getCssDependencies(cssFramework)
          },
          devDependencies: {
            "@types/react": "^18.3.0",
            "@types/react-dom": "^18.3.0",
            typescript: "^5.5.0",
            ...getCssDevDependencies(cssFramework)
          }
        },
        null,
        2
      )
    },
    {
      path: "frontend/tsconfig.json",
      content: JSON.stringify(
        {
          extends: "../tsconfig.base.json",
          compilerOptions: {
            outDir: "./dist",
            rootDir: "./"
          },
          include: [
            "app/**/*",
            "components/**/*",
            "lib/**/*",
            "stores/**/*",
            "schemas/**/*",
            "rakta.config.ts"
          ],
          exclude: ["node_modules", "dist"]
        },
        null,
        2
      )
    },
    {
      path: "frontend/rakta.config.ts",
      content: `import { defineRaktaConfig } from "rakta";

export default defineRaktaConfig({
  appName: "${projectName}",
  render: {
    defaultMode: "csr",
    routes: {
      "/": "ssg",
      "/about": "ssg",
      "/blog": "csg",
      "/blog/:slug": "csg",
      "/dashboard": "csr"
    }
  }
});
`
    },
    {
      path: "frontend/app/layout.tsx",
      content: `import React from "react";
import "../styles/${styleFileName}";

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
`
    },
    {
      path: "frontend/app/page.tsx",
      content: `import React from "react";
import { useCounterStore } from "../stores/counter.store";
import { userSchema } from "../schemas/user.schema";

export default function HomePage() {
  const count = useCounterStore((state) => state.count);
  const increment = useCounterStore((state) => state.increment);
  const decrement = useCounterStore((state) => state.decrement);

  function handleValidate(): void {
    const result = userSchema.safeParse({
      name: "Rakta.js",
      email: "hello@rakta.dev",
      age: 20
    });

    console.log(result);
  }

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

      <section className="feature-card">
        <h2>Rakta Store</h2>
        <p>Count: <strong>{count}</strong></p>

        <div className="button-row">
          <button type="button" onClick={decrement}>Decrement</button>
          <button type="button" onClick={increment}>Increment</button>
        </div>
      </section>

      <section className="feature-card">
        <h2>Rakta Schema</h2>
        <button type="button" onClick={handleValidate}>
          Validate sample user
        </button>
      </section>
    </main>
  );
}
`
    },
    {
      path: "frontend/app/about/page.tsx",
      content: `import React from "react";

export default function AboutPage() {
  return (
    <main className="page-shell">
      <section className="hero-card">
        <p className="eyebrow">ABOUT</p>
        <h1>About ${projectName}</h1>
        <p>
          This project is built with Rakta.js, React, Bun, and TypeScript.
        </p>
        <a href="/">Back to home</a>
      </section>
    </main>
  );
}
`
    },
    {
      path: "frontend/app/blog/page.tsx",
      content: `import React from "react";

const posts = [
  { slug: "getting-started", title: "Getting started with Rakta.js" },
  { slug: "file-based-routing", title: "File-based routing explained" },
  { slug: "type-safe-rpc", title: "Type-safe API with Rakta RPC" }
];

export default function BlogPage() {
  return (
    <main className="page-shell">
      <section className="hero-card">
        <p className="eyebrow">BLOG</p>
        <h1>Articles</h1>

        <ul>
          {posts.map((post) => (
            <li key={post.slug}>
              <a href={\`/blog/\${post.slug}\`}>{post.title}</a>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
`
    },
    {
      path: "frontend/app/blog/[slug]/page.tsx",
      content: `import React from "react";

interface BlogPostPageProps {
  params: {
    slug?: string;
  };
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
  const title = params.slug?.replaceAll("-", " ") ?? "Article";

  return (
    <main className="page-shell">
      <section className="hero-card">
        <p className="eyebrow">BLOG POST</p>
        <h1>{title}</h1>
        <p>This is the blog post for: <code>{params.slug}</code></p>
        <a href="/blog">Back to blog</a>
      </section>
    </main>
  );
}
`
    },
    {
      path: "frontend/app/loading.tsx",
      content: `import React from "react";

export default function Loading() {
  return (
    <main className="page-shell">
      <p>Loading...</p>
    </main>
  );
}
`
    },
    {
      path: "frontend/app/not-found.tsx",
      content: `import React from "react";

export default function NotFound() {
  return (
    <main className="page-shell">
      <section className="hero-card">
        <h1>404</h1>
        <p>The page you are looking for does not exist.</p>
        <a href="/">Return home</a>
      </section>
    </main>
  );
}
`
    },
    {
      path: "frontend/app/error.tsx",
      content: `import React from "react";

interface ErrorPageProps {
  error: Error;
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  return (
    <main className="page-shell">
      <section className="hero-card">
        <h1>Something went wrong</h1>
        <p>{error.message}</p>
        <button type="button" onClick={reset}>Try again</button>
      </section>
    </main>
  );
}
`
    },
    {
      path: "frontend/app/api/hello/route.ts",
      content: `export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);

  return Response.json({
    message: "Hello from Rakta.js API",
    pathname: url.pathname,
    timestamp: new Date().toISOString()
  });
}

export async function POST(request: Request): Promise<Response> {
  const body = await request.json() as Record<string, unknown>;

  return Response.json({
    received: body,
    timestamp: new Date().toISOString()
  });
}
`
    },
    {
      path: "frontend/lib/http.ts",
      content: `export const API_URL = process.env["API_URL"] ?? "http://localhost:4000";

export async function apiGet<TData>(path: string): Promise<TData> {
  const response = await fetch(\`\${API_URL}\${path}\`);

  if (!response.ok) {
    throw new Error(\`Request failed with status \${response.status}\`);
  }

  return response.json() as Promise<TData>;
}
`
    },
    {
      path: "frontend/lib/routes.ts",
      content: `export const ROUTES = {
  home: "/",
  about: "/about",
  blog: "/blog",
  blogPost: (slug: string) => \`/blog/\${slug}\`,
  apiHello: "/api/hello"
} as const;
`
    },
    {
      path: "frontend/lib/utils.ts",
      content: `export function cn(...classes: Array<string | undefined | null | false>): string {
  return classes.filter(Boolean).join(" ");
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
`
    },
    {
      path: "frontend/stores/counter.store.ts",
      content: `interface CounterState {
  count: number;
  increment: () => void;
  decrement: () => void;
}

export function useCounterStore<TSelected>(
  selector: (state: CounterState) => TSelected
): TSelected {
  const state: CounterState = {
    count: 0,
    increment: () => undefined,
    decrement: () => undefined
  };

  return selector(state);
}
`
    },
    {
      path: "frontend/schemas/user.schema.ts",
      content: `export const userSchema = {
  safeParse(input: unknown) {
    if (typeof input !== "object" || input === null) {
      return {
        success: false as const,
        errors: ["Input must be an object"]
      };
    }

    return {
      success: true as const,
      data: input
    };
  }
};
`
    },
    {
      path: `frontend/styles/${styleFileName}`,
      content: getCssGlobals(cssFramework)
    },
    {
      path: "frontend/public/.gitkeep",
      content: ""
    },
    {
      path: "frontend/components/ui/.gitkeep",
      content: ""
    },
    {
      path: "frontend/components/layout/.gitkeep",
      content: ""
    }
  ];
}

function getBackendFiles(config: ProjectConfig): ProjectFile[] {
  return [
    ...getBackendCommonFiles(config),
    ...getBackendFrameworkFiles(config.backendFramework, config)
  ];
}

function getBackendCommonFiles(config: ProjectConfig): ProjectFile[] {
  return [
    {
      path: "backend/src/env.ts",
      content: `function optionalEnv(key: string, fallback: string): string {
  return process.env[key] ?? fallback;
}

export const env = {
  port: Number(optionalEnv("PORT", "4000")),
  nodeEnv: optionalEnv("NODE_ENV", "development"),
  corsOrigin: optionalEnv("CORS_ORIGIN", "http://localhost:3000"),
  databaseUrl: optionalEnv("DATABASE_URL", "")
} as const;
`
    },
    {
      path: "backend/src/config/app.config.ts",
      content: `import { env } from "../env";

export const appConfig = {
  name: "${config.projectName} API",
  version: "0.1.0",
  port: env.port,
  nodeEnv: env.nodeEnv,
  corsOrigin: env.corsOrigin,
  isDev: env.nodeEnv === "development"
} as const;
`
    },
    {
      path: "backend/src/config/database.config.ts",
      content: getDatabaseConfig(config.database)
    },
    {
      path: "backend/src/database/client.ts",
      content: getDatabaseClient(config.database)
    },
    {
      path: "backend/src/controllers/hello.controller.ts",
      content: `export interface HelloResponse {
  success: boolean;
  message: string;
  framework: string;
  version: string;
  timestamp: string;
}

export function helloController(): HelloResponse {
  return {
    success: true,
    message: "Hello from ${config.projectName} API",
    framework: "${BACKEND_DISPLAY[config.backendFramework]}",
    version: "0.1.0",
    timestamp: new Date().toISOString()
  };
}
`
    },
    {
      path: "backend/src/routes/hello.ts",
      content: `import { helloController } from "../controllers/hello.controller";

export { helloController };
`
    },
    {
      path: "backend/.env.example",
      content: getDatabaseEnvExample(config.database)
    },
    {
      path: "backend/tsconfig.json",
      content: JSON.stringify(
        {
          extends: "../tsconfig.base.json",
          compilerOptions: {
            outDir: "./dist",
            rootDir: "./src",
            types: ["node", "bun"]
          },
          include: ["src/**/*"],
          exclude: ["node_modules", "dist"]
        },
        null,
        2
      )
    },
    {
      path: "backend/src/database/schema/.gitkeep",
      content: ""
    }
  ];
}

function getBackendFrameworkFiles(
  framework: BackendFramework,
  config: ProjectConfig
): ProjectFile[] {
  switch (framework) {
    case "gaman":
      return getGamanFiles(config);
    case "express":
      return getExpressFiles(config);
    case "nest":
      return getNestFiles(config);
    case "adonis":
      return getAdonisFiles(config);
    default:
      return getGamanFiles(config);
  }
}

function getGamanFiles(config: ProjectConfig): ProjectFile[] {
  return [
    {
      path: "backend/package.json",
      content: getBackendPackageJson(config, {
        dependencies: {
          ...getDatabaseDependencies(config.database)
        },
        devDependencies: {
          "@types/bun": "^1.1.0"
        }
      })
    },
    {
      path: "backend/src/app.ts",
      content: `import { appConfig } from "./config/app.config";
import { helloController } from "./controllers/hello.controller";

const corsHeaders = {
  "Access-Control-Allow-Origin": appConfig.corsOrigin,
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization"
};

const server = Bun.serve({
  port: appConfig.port,
  fetch(request: Request): Response {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders
      });
    }

    if (url.pathname === "/api/hello" && request.method === "GET") {
      return Response.json(helloController(), {
        headers: corsHeaders
      });
    }

    return Response.json(
      {
        success: false,
        error: "Not found"
      },
      {
        status: 404,
        headers: corsHeaders
      }
    );
  }
});

console.log(\`[${config.projectName}] Backend running at http://localhost:\${server.port}\`);
`
    }
  ];
}

function getExpressFiles(config: ProjectConfig): ProjectFile[] {
  return [
    {
      path: "backend/package.json",
      content: getBackendPackageJson(config, {
        dependencies: {
          express: "^4.19.2",
          cors: "^2.8.5",
          ...getDatabaseDependencies(config.database)
        },
        devDependencies: {
          "@types/express": "^4.17.21",
          "@types/cors": "^2.8.17",
          "@types/node": "^20.0.0"
        }
      })
    },
    {
      path: "backend/src/app.ts",
      content: `import cors from "cors";
import express from "express";
import { appConfig } from "./config/app.config";
import { helloController } from "./controllers/hello.controller";

const app = express();

app.use(cors({ origin: appConfig.corsOrigin }));
app.use(express.json());

app.get("/api/hello", (_request, response) => {
  response.json(helloController());
});

app.use((_request, response) => {
  response.status(404).json({
    success: false,
    error: "Not found"
  });
});

app.listen(appConfig.port, () => {
  console.log(\`[${config.projectName}] Backend running at http://localhost:\${appConfig.port}\`);
});
`
    }
  ];
}

function getNestFiles(config: ProjectConfig): ProjectFile[] {
  return [
    {
      path: "backend/package.json",
      content: getBackendPackageJson(config, {
        dependencies: {
          "@nestjs/common": "^10.3.0",
          "@nestjs/core": "^10.3.0",
          "@nestjs/platform-express": "^10.3.0",
          "reflect-metadata": "^0.2.2",
          ...getDatabaseDependencies(config.database)
        },
        devDependencies: {
          "@types/node": "^20.0.0"
        }
      })
    },
    {
      path: "backend/src/app.ts",
      content: `import "reflect-metadata";
import { Controller, Get, Module } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { appConfig } from "./config/app.config";
import { helloController } from "./controllers/hello.controller";

@Controller("api")
class ApiController {
  @Get("hello")
  hello() {
    return helloController();
  }
}

@Module({
  controllers: [ApiController]
})
class AppModule {}

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: appConfig.corsOrigin });
  await app.listen(appConfig.port);

  console.log(\`[${config.projectName}] Backend running at http://localhost:\${appConfig.port}\`);
}

bootstrap().catch(console.error);
`
    }
  ];
}

function getAdonisFiles(config: ProjectConfig): ProjectFile[] {
  return [
    {
      path: "backend/package.json",
      content: getBackendPackageJson(config, {
        dependencies: {
          "@adonisjs/core": "^6.9.0",
          ...getDatabaseDependencies(config.database)
        },
        devDependencies: {
          "@adonisjs/assembler": "^7.7.0",
          "@types/node": "^20.0.0"
        }
      })
    },
    {
      path: "backend/src/app.ts",
      content: `import { appConfig } from "./config/app.config";
import { helloController } from "./controllers/hello.controller";

const corsHeaders = {
  "Access-Control-Allow-Origin": appConfig.corsOrigin,
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization"
};

const server = Bun.serve({
  port: appConfig.port,
  fetch(request: Request): Response {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders
      });
    }

    if (url.pathname === "/api/hello" && request.method === "GET") {
      return Response.json(helloController(), {
        headers: corsHeaders
      });
    }

    return Response.json(
      {
        success: false,
        error: "Not found"
      },
      {
        status: 404,
        headers: corsHeaders
      }
    );
  }
});

console.log(\`[${config.projectName}] Backend running at http://localhost:\${server.port}\`);
`
    }
  ];
}

function getBackendPackageJson(
  config: ProjectConfig,
  packageConfig: {
    dependencies: Record<string, string>;
    devDependencies: Record<string, string>;
  }
): string {
  return JSON.stringify(
    {
      name: `${config.projectName}-backend`,
      version: "0.1.0",
      private: true,
      type: "module",
      scripts: {
        dev: "bun run --watch src/app.ts",
        build: "bun build src/app.ts --outfile dist/app.js --target bun",
        start: "bun run dist/app.js",
        typecheck: "tsc --noEmit"
      },
      dependencies: {
        rakta: "^0.1.0",
        ...packageConfig.dependencies
      },
      devDependencies: {
        "@types/bun": "^1.1.0",
        typescript: "^5.5.0",
        ...packageConfig.devDependencies
      }
    },
    null,
    2
  );
}

function getSharedFiles(config: ProjectConfig): ProjectFile[] {
  return [
    {
      path: "shared/types/index.ts",
      content: `export interface ApiResponse<TData = unknown> {
  success: boolean;
  data?: TData;
  error?: string;
  message?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}
`
    },
    {
      path: "shared/constants/index.ts",
      content: `export const APP_NAME = "${config.projectName}";
export const API_VERSION = "v1";
export const DEFAULT_PAGE_SIZE = 20;
`
    }
  ];
}

function getDocsFiles(config: ProjectConfig): ProjectFile[] {
  return [
    {
      path: "docs/getting-started.md",
      content: `# Getting started with ${config.projectName}

## Stack

- Frontend: Rakta.js
- CSS: ${CSS_DISPLAY[config.cssFramework]}
- Backend: ${BACKEND_DISPLAY[config.backendFramework]}
- Database: ${DATABASE_DISPLAY[config.database]}

## Run

\`\`\`bash
bun install

# Terminal 1
bun run dev:frontend

# Terminal 2
bun run dev:backend
\`\`\`
`
    }
  ];
}

function getCssDependencies(framework: CssFramework): Record<string, string> {
  switch (framework) {
    case "tailwind":
      return {
        tailwindcss: "^3.4.0"
      };
    case "bootstrap":
      return {
        bootstrap: "^5.3.0"
      };
    case "sass":
      return {};
    default:
      return {};
  }
}

function getCssDevDependencies(framework: CssFramework): Record<string, string> {
  switch (framework) {
    case "sass":
      return {
        sass: "^1.77.0"
      };
    default:
      return {};
  }
}

function getCssGlobals(framework: CssFramework): string {
  switch (framework) {
    case "tailwind":
      return `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --color-primary: #dc2626;
  --color-background: #050505;
  --color-foreground: #f8fafc;
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
}

.button-row {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}
`;
    case "bootstrap":
      return `@import url("https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css");

body {
  margin: 0;
  background: #050505;
  color: #f8fafc;
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
}

.button-row {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}
`;
    case "sass":
      return `$color-primary: #dc2626;
$color-background: #050505;
$color-foreground: #f8fafc;

body {
  margin: 0;
  color: $color-foreground;
  background: $color-background;
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
  color: $color-primary;
  font-weight: 700;
  letter-spacing: 0.12em;
}

.button-row {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}
`;
    default:
      return "";
  }
}

function getDatabaseDependencies(database: Database): Record<string, string> {
  switch (database) {
    case "postgresql":
      return {
        postgres: "^3.4.4"
      };
    case "mysql":
    case "mariadb":
      return {
        mysql2: "^3.9.8"
      };
    case "mongodb":
      return {
        mongodb: "^6.8.0"
      };
    case "firebase":
      return {
        "firebase-admin": "^12.7.0"
      };
    case "sqlite":
      return {};
    case "redis":
      return {
        ioredis: "^5.4.1"
      };
    case "planetscale":
      return {
        "@planetscale/database": "^1.18.0"
      };
    case "neon":
      return {
        "@neondatabase/serverless": "^0.9.4"
      };
    case "turso":
      return {
        "@libsql/client": "^0.6.2"
      };
    default:
      return {};
  }
}

function getDatabaseConfig(database: Database): string {
  switch (database) {
    case "sqlite":
      return `export const databaseConfig = {
  path: process.env["DATABASE_PATH"] ?? "./database.sqlite",
  provider: "sqlite" as const
} as const;
`;
    case "firebase":
      return `export const databaseConfig = {
  projectId: process.env["FIREBASE_PROJECT_ID"] ?? "",
  clientEmail: process.env["FIREBASE_CLIENT_EMAIL"] ?? "",
  privateKey: process.env["FIREBASE_PRIVATE_KEY"]?.replace(/\\\\n/g, "\\n") ?? "",
  databaseUrl: process.env["FIREBASE_DATABASE_URL"] ?? "",
  provider: "firebase" as const
} as const;
`;
    case "turso":
      return `export const databaseConfig = {
  url: process.env["TURSO_DATABASE_URL"] ?? "",
  authToken: process.env["TURSO_AUTH_TOKEN"] ?? "",
  provider: "turso" as const
} as const;
`;
    default:
      return `import { env } from "../env";

export const databaseConfig = {
  url: env.databaseUrl,
  provider: "${database}" as const
} as const;
`;
  }
}

function getDatabaseClient(database: Database): string {
  switch (database) {
    case "postgresql":
      return `import postgres from "postgres";
import { databaseConfig } from "../config/database.config";

export const sql = databaseConfig.url ? postgres(databaseConfig.url) : null;
`;
    case "mysql":
    case "mariadb":
      return `import mysql from "mysql2/promise";
import { databaseConfig } from "../config/database.config";

export const pool = databaseConfig.url
  ? mysql.createPool({
      uri: databaseConfig.url,
      connectionLimit: 10
    })
  : null;
`;
    case "mongodb":
      return `import { MongoClient } from "mongodb";
import { databaseConfig } from "../config/database.config";

export const mongoClient = databaseConfig.url
  ? new MongoClient(databaseConfig.url)
  : null;
`;
    case "firebase":
      return `import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { databaseConfig } from "../config/database.config";

const firebaseCredentialReady =
  databaseConfig.projectId.length > 0 &&
  databaseConfig.clientEmail.length > 0 &&
  databaseConfig.privateKey.length > 0;

export const firebaseApp = getApps()[0] ?? initializeApp(
  firebaseCredentialReady
    ? {
        credential: cert({
          projectId: databaseConfig.projectId,
          clientEmail: databaseConfig.clientEmail,
          privateKey: databaseConfig.privateKey
        }),
        databaseURL: databaseConfig.databaseUrl || undefined
      }
    : undefined
);

export const firestore = getFirestore(firebaseApp);
`;
    case "sqlite":
      return `import { Database } from "bun:sqlite";
import { databaseConfig } from "../config/database.config";

export const db = new Database(databaseConfig.path, {
  create: true
});
`;
    case "redis":
      return `import Redis from "ioredis";
import { databaseConfig } from "../config/database.config";

export const redis = databaseConfig.url ? new Redis(databaseConfig.url) : null;
`;
    case "planetscale":
      return `import { connect } from "@planetscale/database";
import { databaseConfig } from "../config/database.config";

export const connection = databaseConfig.url
  ? connect({ url: databaseConfig.url })
  : null;
`;
    case "neon":
      return `import { neon } from "@neondatabase/serverless";
import { databaseConfig } from "../config/database.config";

export const sql = databaseConfig.url ? neon(databaseConfig.url) : null;
`;
    case "turso":
      return `import { createClient } from "@libsql/client";
import { databaseConfig } from "../config/database.config";

export const db = databaseConfig.url && databaseConfig.authToken
  ? createClient({
      url: databaseConfig.url,
      authToken: databaseConfig.authToken
    })
  : null;
`;
    default:
      return `export const databaseClient = null;
`;
  }
}

function getDatabaseEnvExample(database: Database): string {
  const base = `NODE_ENV=development
PORT=4000
CORS_ORIGIN=http://localhost:3000
`;

  switch (database) {
    case "postgresql":
      return `${base}DATABASE_URL=postgresql://user:password@localhost:5432/dbname
`;
    case "mysql":
      return `${base}DATABASE_URL=mysql://user:password@localhost:3306/dbname
`;
    case "mariadb":
      return `${base}DATABASE_URL=mysql://user:password@localhost:3306/dbname
`;
    case "mongodb":
      return `${base}DATABASE_URL=mongodb://localhost:27017/dbname
`;
    case "firebase":
      return `${base}FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-user@your-firebase-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\nyour-private-key\\n-----END PRIVATE KEY-----\\n"
FIREBASE_DATABASE_URL=https://your-firebase-project-id.firebaseio.com
`;
    case "sqlite":
      return `${base}DATABASE_PATH=./database.sqlite
`;
    case "redis":
      return `${base}DATABASE_URL=redis://localhost:6379
`;
    case "planetscale":
      return `${base}DATABASE_URL=mysql://user:password@aws.connect.psdb.cloud/dbname
`;
    case "neon":
      return `${base}DATABASE_URL=postgresql://user:password@ep-xxx.neon.tech/neondb?sslmode=require
`;
    case "turso":
      return `${base}TURSO_DATABASE_URL=libsql://your-db.turso.io
TURSO_AUTH_TOKEN=your-auth-token
`;
    default:
      return `${base}DATABASE_URL=
`;
  }
}

function generateProjectReadme(config: ProjectConfig): string {
  return `# ${config.projectName}

Built with Rakta.js — Small in size. Fierce in speed. Alive in every route.

## Stack

| Layer | Technology |
| --- | --- |
| Frontend | Rakta.js + React + TypeScript |
| CSS | ${CSS_DISPLAY[config.cssFramework]} |
| Backend | ${BACKEND_DISPLAY[config.backendFramework]} |
| Database | ${DATABASE_DISPLAY[config.database]} |
| Runtime | Bun |

## Run

\`\`\`bash
bun install

# Terminal 1
bun run dev:frontend

# Terminal 2
bun run dev:backend
\`\`\`
`;
}

export function generateProjectFiles(config: ProjectConfig): ProjectFile[] {
  return [
    ...getRootFiles(config),
    ...getFrontendFiles(config),
    ...getBackendFiles(config),
    ...getSharedFiles(config),
    ...getDocsFiles(config)
  ];
}