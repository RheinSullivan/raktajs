import { existsSync, readdirSync, readFileSync } from "node:fs";
import { relative } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { generateBackendFiles } from "./backends/backendRegistry";
import {
	STARTER_CORAL_OBSTACLE_CODE,
	STARTER_CSS_CODE,
	STARTER_PAGE_CODE,
	STARTER_TYPES_CODE,
} from "./starter";
import type {
	CssFramework,
	Database,
	ProjectConfig,
	ProjectFile,
} from "./types";
import { BACKEND_DISPLAY, CSS_DISPLAY, DATABASE_DISPLAY } from "./types";

const DEFAULT_METADATA_TITLE =
	"Rakta.js | Small in size. Fierce in speed. Alive in every route";
const FAVICON_BYTES = readFileSync(
	new URL("../assets/favicon.ico", import.meta.url),
);
const RAKTA_LOGO_SVG = readFileSync(
	new URL("../assets/rakta-logo.svg", import.meta.url),
	"utf-8",
);
const BACKEND_TEMPLATE_URLS = [
	new URL("../templates/fullStack/backend/", import.meta.url),
	new URL("../templates/fullstack/backend/", import.meta.url),
	new URL("./templates/fullStack/backend/", import.meta.url),
	new URL("./templates/fullstack/backend/", import.meta.url),
	new URL("../../../../templates/fullStack/backend/", import.meta.url),
	new URL("../../../../templates/fullstack/backend/", import.meta.url),
	new URL("../../../templates/fullStack/backend/", import.meta.url),
	new URL("../../../templates/fullstack/backend/", import.meta.url),
	pathToFileURL(`${process.cwd()}/templates/fullStack/backend/`),
	pathToFileURL(`${process.cwd()}/templates/fullstack/backend/`),
];
const FRONTEND_ONLY_TEMPLATE_URLS = [
	new URL("../templates/frontendOnly/", import.meta.url),
	new URL("../templates/frontendonly/", import.meta.url),
	new URL("./templates/frontendOnly/", import.meta.url),
	new URL("./templates/frontendonly/", import.meta.url),
	new URL("../../../../templates/frontendOnly/", import.meta.url),
	new URL("../../../../templates/frontendonly/", import.meta.url),
	new URL("../../../templates/frontendOnly/", import.meta.url),
	new URL("../../../templates/frontendonly/", import.meta.url),
	pathToFileURL(`${process.cwd()}/templates/frontendOnly/`),
	pathToFileURL(`${process.cwd()}/templates/frontendonly/`),
];
const FULLSTACK_FRONTEND_TEMPLATE_URLS = [
	new URL("../templates/fullStack/frontend/", import.meta.url),
	new URL("../templates/fullstack/frontend/", import.meta.url),
	new URL("./templates/fullStack/frontend/", import.meta.url),
	new URL("./templates/fullstack/frontend/", import.meta.url),
	new URL("../../../../templates/fullStack/frontend/", import.meta.url),
	new URL("../../../../templates/fullstack/frontend/", import.meta.url),
	new URL("../../../templates/fullStack/frontend/", import.meta.url),
	new URL("../../../templates/fullstack/frontend/", import.meta.url),
	pathToFileURL(`${process.cwd()}/templates/fullStack/frontend/`),
	pathToFileURL(`${process.cwd()}/templates/fullstack/frontend/`),
];

//  Root files
function getRootFiles(projectConfig: ProjectConfig): ProjectFile[] {
	const { projectName, projectMode, useTypeScript, backendFramework } =
		projectConfig;

	// Only Node/Bun backends generate a backend/package.json that Bun workspaces can reference.
	const NODE_BACKEND_FRAMEWORKS = new Set([
		"gaman",
		"nestjs",
		"express",
		"adonis",
		"hono",
	]);
	const isNodeBackend = backendFramework
		? NODE_BACKEND_FRAMEWORKS.has(backendFramework)
		: false;

	const workspaces =
		projectMode === "fullstack"
			? isNodeBackend
				? ["frontend", "backend", "shared"]
				: ["frontend", "shared"]
			: [];

	const files: ProjectFile[] = [
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
									dev: isNodeBackend
										? "bun run dev:frontend & bun run dev:backend"
										: "bun run dev:frontend",
									"dev:frontend": "cd frontend && bun run dev",
									...(isNodeBackend
										? { "dev:backend": "cd backend && bun run dev" }
										: {}),
									"build:frontend": "cd frontend && bun run build",
									...(isNodeBackend
										? { "build:backend": "cd backend && bun run build" }
										: {}),
									build: isNodeBackend
										? "bun run build:frontend && bun run build:backend"
										: "bun run build:frontend",
									...(isNodeBackend
										? { start: "cd backend && bun run start" }
										: {}),
									...(isNodeBackend
										? { migration: "cd backend && bun run migration" }
										: {}),
									...(isNodeBackend
										? { migrate: "cd backend && bun run migrate" }
										: {}),
									...(isNodeBackend
										? { seed: "cd backend && bun run seed" }
										: {}),
									...(isNodeBackend
										? { "db:seed": "cd backend && bun run db:seed" }
										: {}),
									...(useTypeScript
										? {
												typecheck: isNodeBackend
													? "cd frontend && bun run typecheck && cd ../backend && bun run typecheck"
													: "cd frontend && bun run typecheck",
											}
										: {}),
								}
							: {
									dev: "rakta dev",
									build: "rakta build",
									start: "rakta start",
									...(useTypeScript ? { typecheck: "tsc --noEmit" } : {}),
								},
					description: `${projectName} - built with Rakta.js`,
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

	if (useTypeScript) {
		files.splice(1, 0, {
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
		});
	}

	return files;
}

function getAutoImportConfig(autoImport: boolean): string {
	return `  autoImport: {\n    enabled: ${autoImport},\n    directories: ["app", "components", "lib", "stores", "schemas"],\n    outputDirectory: ".rakta",\n    dts: true,\n  },\n`;
}

function getUnifiedRenderConfig(): string {
	return `  render: {\n    defaultMode: "hybrid",\n    routes: {\n      "/": "csr",\n    },\n  },\n`;
}

function applyHookImportMode(sourceCode: string, autoImport: boolean): string {
	if (autoImport) {
		return sourceCode;
	}

	const hookImports = new Set<string>();
	let transformedCode = sourceCode;

	const replacements: ReadonlyArray<readonly [string, string, string]> = [
		["useState", "lengkoState", "lengkoState"],
		["useEffect", "empalEffect", "empalEffect"],
		["useRef", "megamendungRef", "megamendungRef"],
		["useMemo", "kanomanMemo", "kanomanMemo"],
		["useCallback", "kasepuhanCallback", "kasepuhanCallback"],
		["useReducer", "tarlingReducer", "tarlingReducer"],
	];

	for (const [reactHook, raktaHook, importName] of replacements) {
		const hookPattern = new RegExp(`\\b${reactHook}\\b`, "g");

		if (hookPattern.test(transformedCode)) {
			hookImports.add(importName);
			transformedCode = transformedCode.replace(hookPattern, raktaHook);
		}
	}

	transformedCode = transformedCode.replace(
		/^import\s+\{[^}]*rakta[A-Za-z0-9_,\s]*\}\s+from\s+"react";\n/m,
		"",
	);

	if (hookImports.size === 0) {
		return transformedCode;
	}

	const imports = Array.from(hookImports).sort().join(", ");
	return `import { ${imports} } from "raktajs/hooks";\n${transformedCode}`;
}

function findTemplateUrl(candidateUrls: ReadonlyArray<URL>): URL | undefined {
	return candidateUrls.find((candidateUrl) => existsSync(candidateUrl));
}

function getFrontendTemplateFiles(
	projectConfig: ProjectConfig,
	candidateUrls: ReadonlyArray<URL>,
	outputRoot: string,
): ProjectFile[] | undefined {
	const templateUrl = findTemplateUrl(candidateUrls);

	if (templateUrl === undefined) {
		return undefined;
	}

	const templateRootPath = fileURLToPath(templateUrl);
	const templateFiles = readTemplateFiles(
		templateRootPath,
		templateRootPath,
		outputRoot,
	);

	const personalizedFiles = templateFiles.map((file) => {
		if (typeof file.content !== "string") {
			return file;
		}

		return {
			...file,
			content: personalizeFrontendTemplate(
				file.path,
				file.content,
				projectConfig,
			),
		};
	});

	return processFilesForLanguage(
		personalizedFiles,
		projectConfig.useTypeScript,
	);
}

function personalizeFrontendTemplate(
	filePath: string,
	content: string,
	projectConfig: ProjectConfig,
): string {
	const normalizedPath = filePath.replaceAll("\\", "/");

	if (
		normalizedPath === "package.json" ||
		normalizedPath === "frontend/package.json"
	) {
		const packageJson = JSON.parse(content) as {
			name?: string;
			scripts?: Record<string, string>;
			dependencies?: Record<string, string>;
			devDependencies?: Record<string, string>;
		};
		const isFullstackFrontend = normalizedPath.startsWith("frontend/");

		return JSON.stringify(
			{
				...packageJson,
				name: isFullstackFrontend
					? `${projectConfig.projectName}-frontend`
					: projectConfig.projectName,
				version: "0.1.0",
				private: true,
				type: "module",
				scripts: {
					dev: "rakta dev",
					build: "rakta build",
					start: "rakta start",
					routes: "rakta routes",
					"imports:generate": "rakta imports:generate",
					...(isFullstackFrontend ? { "rpc:types": "rakta rpc:types" } : {}),
					...(projectConfig.useTypeScript ? { typecheck: "tsc --noEmit" } : {}),
					...(packageJson.scripts ?? {}),
				},
				dependencies: {
					...(packageJson.dependencies ?? {}),
					raktajs: "^1.2.0",
					react: "^19.2.7",
					"react-dom": "^19.2.7",
					gsap: "^3.12.7",
					clsx: "^2.1.1",
					"tailwind-merge": "^3.0.2",
					"react-icons": "^5.7.0",
					...getCssDependencies(projectConfig.cssFramework),
				},
				devDependencies: {
					...(packageJson.devDependencies ?? {}),
					...(projectConfig.useTypeScript
						? {
								"@types/react": "^19.2.17",
								"@types/react-dom": "^19.2.3",
								typescript: "^6.0.3",
							}
						: {}),
					autoprefixer: "^10.4.20",
					postcss: "^8.5.3",
					prettier: "^3.5.3",
					...getCssDevDependencies(projectConfig.cssFramework),
				},
			},
			null,
			2,
		);
	}

	if (
		normalizedPath === "rakta.config.ts" ||
		normalizedPath === "rakta.config.js" ||
		normalizedPath === "frontend/rakta.config.ts" ||
		normalizedPath === "frontend/rakta.config.js"
	) {
		const personalizedConfig = content
			.replace(/appName:\s*"[^"]*"/, `appName: "${projectConfig.projectName}"`)
			.replace(
				/enabled:\s*(true|false)/,
				`enabled: ${projectConfig.autoImport}`,
			)
			.replace(
				/defaultTitle:\s*"[^"]*"/,
				`defaultTitle: "${DEFAULT_METADATA_TITLE}"`,
			);

		return personalizedConfig.replace(
			/render:\s*\{[\s\S]*?\n\s*\},?\n\}\);/,
			`${getUnifiedRenderConfig()}});`,
		);
	}

	if (
		projectConfig.cssFramework !== "tailwind" &&
		(normalizedPath === "styles/globals.css" ||
			normalizedPath === "frontend/styles/globals.css")
	) {
		return getFrontendOnlyCssGlobals(projectConfig.cssFramework);
	}

	if (!projectConfig.autoImport && normalizedPath.startsWith("app/")) {
		return applyHookImportMode(content, false);
	}

	if (!projectConfig.autoImport && normalizedPath.startsWith("frontend/app/")) {
		return applyHookImportMode(content, false);
	}

	return content;
}

//  Frontend-only starter (ShrimpRun game)
function getFrontendOnlyFiles(projectConfig: ProjectConfig): ProjectFile[] {
	const templateFiles = getFrontendTemplateFiles(
		projectConfig,
		FRONTEND_ONLY_TEMPLATE_URLS,
		"",
	);

	if (templateFiles !== undefined) {
		return templateFiles;
	}

	const { projectName, cssFramework, useTypeScript, autoImport } =
		projectConfig;
	const styleFileName =
		cssFramework === "sass" ? "globals.scss" : "globals.css";
	const pageExtension = useTypeScript ? "tsx" : "jsx";
	const scriptExtension = useTypeScript ? "ts" : "js";

	const files: ProjectFile[] = [
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
						...(useTypeScript ? { typecheck: "tsc --noEmit" } : {}),
					},
					dependencies: {
						raktajs: "^1.2.0",
						gsap: "^3.12.7",
						clsx: "^2.1.1",
						"tailwind-merge": "^3.0.2",
						react: "^19.2.7",
						"react-dom": "^19.2.7",
						"react-icons": "^5.7.0",
						...getCssDependencies(cssFramework),
					},
					devDependencies: useTypeScript
						? {
								"@types/react": "^19.2.17",
								"@types/react-dom": "^19.2.3",
								autoprefixer: "^10.4.20",
								postcss: "^8.5.3",
								prettier: "^3.5.3",
								typescript: "^6.0.3",
								...getCssDevDependencies(cssFramework),
							}
						: {
								autoprefixer: "^10.4.20",
								postcss: "^8.5.3",
								prettier: "^3.5.3",
								...getCssDevDependencies(cssFramework),
							},
				},
				null,
				2,
			),
		},
		{
			path: `rakta.config.${scriptExtension}`,
			content: `import { defineRaktaConfig } from "raktajs";\n\nexport default defineRaktaConfig({\n  appName: "${projectName}",\n${getAutoImportConfig(autoImport)}  seo: {\n    defaultTitle: "${DEFAULT_METADATA_TITLE}",\n    defaultDescription: "Built with Rakta.js - Small in size. Fierce in speed. Alive in every route.",\n  },\n${getUnifiedRenderConfig()}});\n`,
		},
		{
			path: `app/layout.${pageExtension}`,
			content: generateFrontendOnlyLayout(),
		},
		{
			path: `app/page.${pageExtension}`,
			content: applyHookImportMode(
				generateFrontendOnlyPage(projectName),
				autoImport,
			),
		},
		{
			path: `app/loading.${pageExtension}`,
			content: generateFrontendOnlyLoading(),
		},
		{
			path: `app/error.${pageExtension}`,
			content: generateFrontendOnlyError(),
		},
		{
			path: `app/notFound.${pageExtension}`,
			content: generateFrontendOnlyNotFound(),
		},
		{
			path: `app/components/CoralObstacle.${pageExtension}`,
			content: STARTER_CORAL_OBSTACLE_CODE,
		},
		{
			path: `app/types.${scriptExtension}`,
			content: STARTER_TYPES_CODE,
		},
		{
			path: `styles/${styleFileName}`,
			content:
				cssFramework === "tailwind"
					? STARTER_CSS_CODE
					: getFrontendOnlyCssGlobals(cssFramework),
		},
		{
			path: "postcss.config.ts",
			content: `// PostCSS config\nconst config = {\n\tplugins: {\n\t\t"@tailwindcss/postcss": {},\n\t\tautoprefixer: {},\n\t},\n};\n\nexport default config;\n`,
		},
		{
			path: "public/.gitkeep",
			content: "",
		},
		{
			path: "public/favicon.ico",
			content: FAVICON_BYTES,
		},
		{
			// Rakta.js brand logo used in navbar and footer of the starter page
			path: "public/rakta-logo.svg",
			content: RAKTA_LOGO_SVG,
		},
	];

	if (useTypeScript) {
		files.splice(
			1,
			0,
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
		);
	}

	return processFilesForLanguage(files, useTypeScript);
}

// ─── Fullstack frontend files

function getFullstackFrontendFiles(
	projectConfig: ProjectConfig,
): ProjectFile[] {
	const templateFiles = getFrontendTemplateFiles(
		projectConfig,
		FULLSTACK_FRONTEND_TEMPLATE_URLS,
		"frontend",
	);

	if (templateFiles !== undefined) {
		return templateFiles;
	}

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
						raktajs: "^1.2.0",
						react: "^19.2.7",
						"react-dom": "^19.2.7",
						gsap: "^3.12.7",
						clsx: "^2.1.1",
						"tailwind-merge": "^3.0.2",
						"react-icons": "^5.7.0",
						...getCssDependencies(cssFramework),
					},
					devDependencies: {
						"@types/react": "^19.2.17",
						"@types/react-dom": "^19.2.3",
						autoprefixer: "^10.4.20",
						postcss: "^8.5.3",
						prettier: "^3.5.3",
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
						"rakta-env.d.ts",
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
			content: `import { defineRaktaConfig } from "raktajs";\n\nexport default defineRaktaConfig({\n  appName: "${projectName}",\n${getAutoImportConfig(projectConfig.autoImport)}  seo: {\n    defaultTitle: "${DEFAULT_METADATA_TITLE}",\n    defaultDescription: "Built with Rakta.js - Small in size. Fierce in speed. Alive in every route.",\n  },\n  render: {\n    defaultMode: "csr",\n    routes: {\n      "/": "ssg",\n      "/about": "ssg",\n      "/blog": "csg",\n      "/blog/:slug": "csg",\n      "/dashboard": "csr"\n    }\n  }\n});\n`,
		},
		{
			path: "frontend/rakta-env.d.ts",
			content: generateFrontendOnlyRaktaEnv(),
		},
		{
			path: "frontend/app/layout.tsx",
			content: `import "../styles/${styleFileName}";\n\ninterface RootLayoutProps {\n  readonly children: React.ReactNode;\n}\n\nexport default function RootLayout({ children }: RootLayoutProps) {\n  return (\n    <html  lang="en">\n      <body>{children}</body>\n    </html>\n  );\n}\n`,
		},
		{
			path: "frontend/app/page.tsx",
			content: generateFullstackHomePage(projectName),
		},
		{
			path: "frontend/app/about/page.tsx",
			content: `export default function AboutPage() {\n  return (\n    <main className="page-shell">\n      <section className="hero-card">\n        <p className="eyebrow">ABOUT</p>\n        <h1>About ${projectName}</h1>\n        <p>This project is built with Rakta.js, React, Bun, and TypeScript.</p>\n        <Click to="/">Back to home</Click>\n      </section>\n    </main>\n  );\n}\n`,
		},
		{
			path: "frontend/app/blog/page.tsx",
			content: `const BLOG_POSTS = [\n  { slug: "getting-started", title: "Getting started with Rakta.js" },\n  { slug: "file-based-routing", title: "File-based routing explained" },\n  { slug: "type-safe-rpc", title: "Type-safe API with CarubanWire" },\n];\n\nexport default function BlogPage() {\n  return (\n    <main className="page-shell">\n      <section className="hero-card">\n        <p className="eyebrow">BLOG</p>\n        <h1>Articles</h1>\n        <ul>\n          {BLOG_POSTS.map((post) => (\n            <li key={post.slug}>\n              <Click to={\`/blog/\${post.slug}\`}>{post.title}</Click>\n            </li>\n          ))}\n        </ul>\n      </section>\n    </main>\n  );\n}\n`,
		},
		{
			path: "frontend/app/blog/[slug]/page.tsx",
			content: `interface BlogPostPageProps {\n  readonly params: {\n    readonly slug?: string;\n  };\n}\n\nexport default function BlogPostPage({ params }: BlogPostPageProps) {\n  const postTitle = params.slug?.replaceAll("-", " ") ?? "Article";\n\n  return (\n    <main className="page-shell">\n      <section className="hero-card">\n        <p className="eyebrow">BLOG POST</p>\n        <h1>{postTitle}</h1>\n        <p>Slug: <code>{params.slug}</code></p>\n        <Click to="/blog">Back to blog</Click>\n      </section>\n    </main>\n  );\n}\n`,
		},
		{
			path: "frontend/app/loading.tsx",
			content: `export default function Loading() {\n  return (\n    <main className="page-shell">\n      <p>Loading...</p>\n    </main>\n  );\n}\n`,
		},
		{
			path: "frontend/app/error.tsx",
			content: `interface ErrorPageProps {\n  readonly error: Error;\n  readonly reset: () => void;\n}\n\nexport default function ErrorPage({ error, reset }: ErrorPageProps) {\n  return (\n    <main className="page-shell">\n      <section className="hero-card">\n        <h1>Something went wrong</h1>\n        <p>{error.message}</p>\n        <button type="button" onClick={reset}>Try again</button>\n      </section>\n    </main>\n  );\n}\n`,
		},
		{
			path: "frontend/app/not-found.tsx",
			content: `export default function NotFound() {\n  return (\n    <main className="page-shell">\n      <section className="hero-card">\n        <h1>404</h1>\n        <p>The page you are looking for does not exist.</p>\n        <Click to="/">Return home</Click>\n      </section>\n    </main>\n  );\n}\n`,
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
			content: getFrontendOnlyCssGlobals(cssFramework),
		},
		{
			path: "frontend/postcss.config.ts",
			content: `// PostCSS config\nconst config = {\n\tplugins: {\n\t\t"@tailwindcss/postcss": {},\n\t\tautoprefixer: {},\n\t},\n};\n\nexport default config;\n`,
		},
		{
			path: "frontend/public/.gitkeep",
			content: "",
		},
		{
			path: "frontend/public/favicon.ico",
			content: FAVICON_BYTES,
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

//  Backend files

function stripTypeScriptSyntax(code: string): string {
	return new Bun.Transpiler({ loader: "tsx", target: "browser" }).transformSync(
		code,
	);
}

function processFilesForLanguage(
	files: ProjectFile[],
	useTypeScript: boolean,
): ProjectFile[] {
	if (useTypeScript) {
		return files;
	}

	return files
		.filter(
			(file) =>
				!file.path.endsWith(".d.ts") &&
				!file.path.endsWith("types.ts") &&
				!file.path.endsWith("types.js"),
		)
		.map((file) => {
			if (typeof file.content !== "string") {
				return file;
			}

			let path = file.path;
			if (path.endsWith(".tsx")) path = path.replace(/\.tsx$/, ".jsx");
			else if (path.endsWith(".ts")) path = path.replace(/\.ts$/, ".js");

			if (!file.path.endsWith(".tsx") && !file.path.endsWith(".ts")) {
				return {
					path,
					content: file.content,
				};
			}

			return {
				path,
				content: stripTypeScriptSyntax(file.content),
			};
		});
}

function getBackendFiles(projectConfig: ProjectConfig): ProjectFile[] {
	return generateBackendFiles(projectConfig);
}

function _getNestTemplateFiles(projectConfig: ProjectConfig): ProjectFile[] {
	const projectName = projectConfig.projectName;

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
	getHealthStatus(): Record<string, string> {
		return {
			status: "ok",
			framework: "Nest.js",
			timestamp: new Date().toISOString(),
		};
	}
}
`;

	const tsconfigContent = JSON.stringify(
		{
			compilerOptions: {
				module: "commonjs",
				target: "ES2021",
				experimentalDecorators: true,
				emitDecoratorMetadata: true,
				strict: true,
				outDir: "./dist",
			},
		},
		null,
		2,
	);

	const readmeContent = `# ${projectName} - Nest.js Backend

Structured enterprise Node.js backend for Rakta.js frontend.

## Commands

\`\`\`bash
bun install
bun run dev
\`\`\`
`;

	return [
		{ path: "backend/package.json", content: packageJsonContent },
		{ path: "backend/tsconfig.json", content: tsconfigContent },
		{ path: "backend/src/main.ts", content: mainContent },
		{ path: "backend/src/app.module.ts", content: appModuleContent },
		{ path: "backend/src/app.controller.ts", content: appControllerContent },
		{ path: "backend/README.md", content: readmeContent },
	];
}

function _getExpressTemplateFiles(projectConfig: ProjectConfig): ProjectFile[] {
	const projectName = projectConfig.projectName;

	const packageJsonContent = JSON.stringify(
		{
			name: `${projectName}-backend`,
			version: "0.1.0",
			private: true,
			type: "module",
			scripts: {
				dev: "bun run --watch src/index.ts",
				build: "tsc",
				start: "node dist/index.js",
			},
			dependencies: {
				express: "^4.19.2",
				cors: "^2.8.5",
				dotenv: "^16.4.5",
			},
			devDependencies: {
				"@types/express": "^4.17.21",
				"@types/cors": "^2.8.17",
				"@types/node": "^20.11.0",
				typescript: "^5.3.3",
			},
		},
		null,
		2,
	);

	const indexContent = `import express from "express";
import cors from "cors";

const application = express();
application.use(cors({ origin: "http://localhost:3000" }));
application.use(express.json());

application.get("/health", (_request, response) => {
	response.json({
		status: "ok",
		framework: "Express.js",
		timestamp: new Date().toISOString(),
	});
});

const portNumber = Number.parseInt(process.env["PORT"] ?? "4000", 10);
application.listen(portNumber, () => {
	console.log(\`Express.js backend running on http://localhost:\${portNumber}\`);
});
`;

	const readmeContent = `# ${projectName} - Express.js Backend

Minimal Node.js backend for Rakta.js frontend.

## Commands

\`\`\`bash
bun install
bun run dev
\`\`\`
`;

	return [
		{ path: "backend/package.json", content: packageJsonContent },
		{ path: "backend/src/index.ts", content: indexContent },
		{ path: "backend/README.md", content: readmeContent },
	];
}

function _getAdonisTemplateFiles(projectConfig: ProjectConfig): ProjectFile[] {
	const projectName = projectConfig.projectName;

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
				"@adonisjs/core": "^6.3.0",
				"@adonisjs/cors": "^2.2.1",
			},
			devDependencies: {
				typescript: "^5.3.3",
			},
		},
		null,
		2,
	);

	const serverContent = `import { Ignitor, prettyPrintError } from "@adonisjs/core";

const applicationRoot = new URL("../", import.meta.url);
const ignitorInstance = new Ignitor(applicationRoot, { importer: (filePath) => import(filePath) });

ignitorInstance
	.tap((application) => {
		application.listen(4000);
	})
	.catch((error) => {
		prettyPrintError(error);
		process.exitCode = 1;
	});
`;

	const routesContent = `import router from "@adonisjs/core/services/router";

router.get("/health", async () => {
	return {
		status: "ok",
		framework: "AdonisJS",
		timestamp: new Date().toISOString(),
	};
});
`;

	const readmeContent = `# ${projectName} - AdonisJS Backend

Fullstack TypeScript Node.js backend for Rakta.js frontend.

## Commands

\`\`\`bash
bun install
bun run dev
\`\`\`
`;

	return [
		{ path: "backend/package.json", content: packageJsonContent },
		{ path: "backend/bin/server.ts", content: serverContent },
		{ path: "backend/start/routes.ts", content: routesContent },
		{ path: "backend/README.md", content: readmeContent },
	];
}

function _getFlaskTemplateFiles(projectConfig: ProjectConfig): ProjectFile[] {
	const projectName = projectConfig.projectName;

	const requirementsContent = `Flask==3.0.3
Flask-CORS==4.0.1
python-dotenv==1.0.1
`;

	const appPyContent = `from flask import Flask, jsonify
from flask_cors import CORS
import datetime

application = Flask(__name__)
CORS(application, origins=["http://localhost:3000"])

@application.route("/health", methods=["GET"])
def health_status():
    return jsonify({
        "status": "ok",
        "framework": "Flask (Python)",
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat()
    })

if __name__ == "__main__":
    application.run(host="0.0.0.0", port=4000, debug=True)
`;

	const readmeContent = `# ${projectName} - Flask Backend

Lightweight Python backend for Rakta.js frontend.

## Commands

\`\`\`bash
pip install -r requirements.txt
python app.py
\`\`\`
`;

	return [
		{ path: "backend/requirements.txt", content: requirementsContent },
		{ path: "backend/app.py", content: appPyContent },
		{ path: "backend/README.md", content: readmeContent },
	];
}

function _getPrabogoTemplateFiles(projectConfig: ProjectConfig): ProjectFile[] {
	const projectName = projectConfig.projectName;
	const moduleName = projectConfig.projectName.replaceAll("-", "_");

	const goModContent = `module ${moduleName}/backend

go 1.24.0
`;

	const mainGoContent = `package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

func main() {
	http.HandleFunc("/health", func(responseWriter http.ResponseWriter, request *http.Request) {
		responseWriter.Header().Set("Content-Type", "application/json")
		responseWriter.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
		json.NewEncoder(responseWriter).Encode(map[string]string{
			"status":    "ok",
			"framework": "Prabogo (Golang)",
			"timestamp": time.Now().Format(time.RFC3339),
		})
	})

	fmt.Println("Prabogo (Golang) backend running on http://localhost:4000")
	http.ListenAndServe(":4000", nil)
}
`;

	const readmeContent = `# ${projectName} - Prabogo (Golang) Backend

Golang web framework backend with hexagonal architecture for Rakta.js frontend.

## Commands

\`\`\`bash
go run main.go
\`\`\`
`;

	return [
		{ path: "backend/go.mod", content: goModContent },
		{ path: "backend/main.go", content: mainGoContent },
		{ path: "backend/README.md", content: readmeContent },
	];
}

function _getRailsTemplateFiles(projectConfig: ProjectConfig): ProjectFile[] {
	const projectName = projectConfig.projectName;

	const gemfileContent = `source 'https://rubygems.org'
git_source(:github) { |repo| "https://github.com/#{repo}.git" }

ruby '3.4.1'

gem 'rails', '~> 7.1.3'
gem 'puma', '~> 6.4'
gem 'rack-cors'
`;

	const routesRbContent = `Rails.application.routes.draw do
  get '/health', to: proc { [200, { 'Content-Type' => 'application/json' }, [{ status: 'ok', framework: 'Ruby on Rails', timestamp: Time.now.iso8601 }.to_json]] }
end
`;

	const readmeContent = `# ${projectName} - Ruby on Rails Backend

Convention-driven Ruby backend for Rakta.js frontend.

## Commands

\`\`\`bash
bundle install
bin/rails server -p 4000
\`\`\`
`;

	return [
		{ path: "backend/Gemfile", content: gemfileContent },
		{ path: "backend/config/routes.rb", content: routesRbContent },
		{ path: "backend/README.md", content: readmeContent },
	];
}

function _getSpringBootTemplateFiles(
	projectConfig: ProjectConfig,
): ProjectFile[] {
	const projectName = projectConfig.projectName;

	const pomXmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.4</version>
        <relativePath/>
    </parent>
    <groupId>com.example</groupId>
    <artifactId>${projectName}-backend</artifactId>
    <version>0.1.0</version>
    <name>backend</name>
    <properties>
        <java.version>21</java.version>
    </properties>
    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
    </dependencies>
</project>
`;

	const applicationJavaContent = `package com.example.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import java.time.Instant;
import java.util.Map;

@SpringBootApplication
@RestController
public class BackendApplication {

    public static void main(String[] arguments) {
        SpringApplication.run(BackendApplication.class, arguments);
    }

    @GetMapping("/health")
    public Map<String, String> getHealthStatus() {
        return Map.of(
            "status", "ok",
            "framework", "Spring Boot",
            "timestamp", Instant.now().toString()
        );
    }
}
`;

	const applicationPropertiesContent = `server.port=4000
`;

	const readmeContent = `# ${projectName} - Spring Boot Backend

Enterprise Java backend for Rakta.js frontend.

## Commands

\`\`\`bash
./mvnw spring-boot:run
\`\`\`
`;

	return [
		{ path: "backend/pom.xml", content: pomXmlContent },
		{
			path: "backend/src/main/java/com/example/backend/BackendApplication.java",
			content: applicationJavaContent,
		},
		{
			path: "backend/src/main/resources/application.properties",
			content: applicationPropertiesContent,
		},
		{ path: "backend/README.md", content: readmeContent },
	];
}

function _getLaravelTemplateFiles(projectConfig: ProjectConfig): ProjectFile[] {
	const projectName = projectConfig.projectName;
	const databaseName = projectConfig.projectName.replaceAll("-", "_");

	const composerContent = JSON.stringify(
		{
			name: `${projectName}/backend`,
			type: "project",
			description: `${projectName} Laravel + MySQL backend for Rakta.js`,
			keywords: ["framework", "laravel", "mysql", "raktajs"],
			license: "MIT",
			require: {
				php: "^8.2",
				"laravel/framework": "^11.0",
				"laravel/sanctum": "^4.0",
				"laravel/tinker": "^2.9",
			},
			autoload: {
				"psr-4": {
					"App\\": "app/",
					"Database\\Factories\\": "database/factories/",
					"Database\\Seeders\\": "database/seeders/",
				},
			},
			scripts: {
				"post-autoload-dump": [
					"Illuminate\\Foundation\\ComposerScripts::postAutoloadDump",
				],
			},
		},
		null,
		2,
	);

	const environmentContent = `APP_NAME="${projectName}"
APP_ENV=local
APP_KEY=base64:c3VwZXJzZWNyZXRyYWt0YWphdmFzY3JpcHRrZXkxMjM=
APP_DEBUG=true
APP_TIMEZONE=UTC
APP_URL=http://localhost:4000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE="${databaseName}"
DB_USERNAME=root
DB_PASSWORD=

SESSION_DRIVER=database
SESSION_LIFETIME=120
FRONTEND_URL=http://localhost:3000
`;

	const artisanContent = `#!/usr/bin/env php
<?php

define('LARAVEL_START', microtime(true));

require __DIR__.'/vendor/autoload.php';

$application = require_once __DIR__.'/bootstrap/app.php';

$kernel = $application->make(Illuminate\\Contracts\\Console\\Kernel::class);

$status = $kernel->handle(
    $input = new Symfony\\Component\\Console\\Input\\ArgvInput,
    new Symfony\\Component\\Console\\Output\\ConsoleOutput
);

$kernel->terminate($input, $status);

exit($status);
`;

	const databaseConfigContent = `<?php

return [
    'default' => env('DB_CONNECTION', 'mysql'),
    'connections' => [
        'mysql' => [
            'driver' => 'mysql',
            'host' => env('DB_HOST', '127.0.0.1'),
            'port' => env('DB_PORT', '3306'),
            'database' => env('DB_DATABASE', '${databaseName}'),
            'username' => env('DB_USERNAME', 'root'),
            'password' => env('DB_PASSWORD', ''),
            'charset' => 'utf8mb4',
            'collation' => 'utf8mb4_unicode_ci',
            'prefix' => '',
            'strict' => true,
            'engine' => null,
        ],
    ],
];
`;

	const corsConfigContent = `<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => [env('FRONTEND_URL', 'http://localhost:3000')],
    'allowed_headers' => ['*'],
    'supports_credentials' => true,
];
`;

	const apiRoutesContent = `<?php

use Illuminate\\Http\\Request;
use Illuminate\\Support\\Facades\\Route;
use App\\Http\\Controllers\\AuthController;
use App\\Http\\Controllers\\UserController;

Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'framework' => 'Rakta.js + Laravel',
        'timestamp' => now()->toIso8601String(),
    ]);
});

Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/auth/me', [AuthController::class, 'userInformation']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/users', [UserController::class, 'index']);
    Route::get('/users/{user}', [UserController::class, 'show']);
});
`;

	const authControllerContent = `<?php

namespace App\\Http\\Controllers;

use App\\Models\\User;
use Illuminate\\Http\\Request;
use Illuminate\\Support\\Facades\\Auth;
use Illuminate\\Support\\Facades\\Hash;
use Illuminate\\Validation\\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
        ]);

        $user = User::create([
            'name' => $validatedData['name'],
            'email' => $validatedData['email'],
            'password' => Hash::make($validatedData['password']),
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'access_token' => $token,
            'token_type' => 'Bearer',
        ], 201);
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        if (!Auth::attempt($credentials)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials do not match our records.'],
            ]);
        }

        $user = User::where('email', $request->email)->firstOrFail();
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'access_token' => $token,
            'token_type' => 'Bearer',
        ]);
    }

    public function userInformation(Request $request)
    {
        return response()->json($request->user());
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully']);
    }
}
`;

	const userControllerContent = `<?php

namespace App\\Http\\Controllers;

use App\\Models\\User;

class UserController extends Controller
{
    public function index()
    {
        return response()->json(User::paginate(15));
    }

    public function show(User $user)
    {
        return response()->json($user);
    }
}
`;

	const userModelContent = `<?php

namespace App\\Models;

use Illuminate\\Database\\Eloquent\\Factories\\HasFactory;
use Illuminate\\Foundation\\Auth\\User as Authenticatable;
use Illuminate\\Notifications\\Notifiable;
use Laravel\\Sanctum\\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];
}
`;

	const migrationContent = `<?php

use Illuminate\\Database\\Migrations\\Migration;
use Illuminate\\Database\\Schema\\Blueprint;
use Illuminate\\Support\\Facades\\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->rememberToken();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
`;

	const readmeContent = `# ${projectName} - Laravel + MySQL Backend

Integrated Laravel + MySQL backend for Rakta.js frontend.

## Commands

\`\`\`bash
# Install PHP dependencies
composer install

# Copy environment file and generate key
cp .env.example .env
php artisan key:generate

# Run database migrations
php artisan migrate

# Start development server
php artisan serve --port=4000
\`\`\`
`;

	return [
		{ path: "backend/composer.json", content: composerContent },
		{ path: "backend/.env.example", content: environmentContent },
		{ path: "backend/artisan", content: artisanContent },
		{ path: "backend/config/database.php", content: databaseConfigContent },
		{ path: "backend/config/cors.php", content: corsConfigContent },
		{ path: "backend/routes/api.php", content: apiRoutesContent },
		{
			path: "backend/app/Http/Controllers/Controller.php",
			content:
				"<?php\n\nnamespace App\\Http\\Controllers;\n\nabstract class Controller {}\n",
		},
		{
			path: "backend/app/Http/Controllers/AuthController.php",
			content: authControllerContent,
		},
		{
			path: "backend/app/Http/Controllers/UserController.php",
			content: userControllerContent,
		},
		{ path: "backend/app/Models/User.php", content: userModelContent },
		{
			path: "backend/database/migrations/2026_01_01_000000_create_users_table.php",
			content: migrationContent,
		},
		{ path: "backend/README.md", content: readmeContent },
	];
}

function _getGamanTemplateFiles(projectConfig: ProjectConfig): ProjectFile[] {
	const templateUrl = BACKEND_TEMPLATE_URLS.find((candidateUrl) =>
		existsSync(candidateUrl),
	);

	if (templateUrl === undefined) {
		throw new Error(
			"The Gaman.js fullstack backend template is missing. Expected a bundled dist/templates/fullStack/backend template or the repository templates/fullStack/backend source.",
		);
	}

	const templateRootPath = fileURLToPath(templateUrl);
	const templateFiles = readTemplateFiles(
		templateRootPath,
		templateRootPath,
		"backend",
	);

	return templateFiles.map((file) => {
		if (typeof file.content !== "string") {
			return file;
		}

		return {
			...file,
			content: personalizeGamanTemplate(file.path, file.content, projectConfig),
		};
	});
}

function readTemplateFiles(
	baseRootPath: string,
	templateRootPath: string,
	outputRoot: string,
): ProjectFile[] {
	const files: ProjectFile[] = [];
	const entries = readdirSync(templateRootPath, { withFileTypes: true });

	for (const entry of entries) {
		const entryPath = fileURLToPath(
			new URL(entry.name, `${pathToFileURL(templateRootPath)}/`),
		);

		if (entry.isDirectory()) {
			if (
				entry.name === "node_modules" ||
				entry.name === ".rakta" ||
				entry.name === ".git" ||
				entry.name === "dist"
			) {
				continue;
			}
			files.push(...readTemplateFiles(baseRootPath, entryPath, outputRoot));
			continue;
		}

		if (!entry.isFile()) {
			continue;
		}

		const relativePath = relative(baseRootPath, entryPath).replaceAll(
			"\\",
			"/",
		);

		files.push({
			path:
				outputRoot.length > 0 ? `${outputRoot}/${relativePath}` : relativePath,
			content: isBinaryTemplateFile(relativePath)
				? readFileSync(entryPath)
				: readFileSync(entryPath, "utf-8"),
		});
	}

	return files;
}

function isBinaryTemplateFile(filePath: string): boolean {
	return /\.(?:ico|png|jpe?g|webp|gif|avif|woff2?|ttf|otf)$/i.test(filePath);
}

function personalizeGamanTemplate(
	filePath: string,
	content: string,
	projectConfig: ProjectConfig,
): string {
	if (filePath === "backend/package.json") {
		const packageJson = JSON.parse(content) as {
			name: string;
			dependencies?: Record<string, string>;
		};

		return JSON.stringify(
			{
				...packageJson,
				name: `${projectConfig.projectName}-backend`,
				dependencies: {
					...(packageJson.dependencies ?? {}),
					...getDatabaseDependencies(projectConfig.database),
				},
			},
			null,
			2,
		);
	}

	if (filePath === "backend/src/controllers/hello.controller.ts") {
		return content
			.replace(
				"Hello from Rakta fullstack backend.",
				`Hello from ${projectConfig.projectName} Gaman.js backend.`,
			)
			.replace('framework: "Rakta.js"', 'framework: "Gaman.js"');
	}

	if (filePath === "backend/src/index.ts") {
		return content.replace(
			"Rakta Gaman.js backend running",
			`${projectConfig.projectName} Gaman.js backend running`,
		);
	}

	if (filePath === "backend/src/env.ts") {
		const authStrategy = projectConfig.authStrategy ?? "jwt";
		const sessionMode =
			projectConfig.sessionPolicy === "single-session" ||
			projectConfig.sessionPolicy === "single-device" ||
			projectConfig.sessionPolicy === "revoke-previous"
				? "single"
				: "multiple";
		return content
			.replace(
				'sessionMode: optionalEnv("SESSION_MODE", "single")',
				`sessionMode: optionalEnv("SESSION_MODE", "${sessionMode}")`,
			)
			.replace(
				'authStrategy: optionalEnv("AUTH_STRATEGY", "jwt")',
				`authStrategy: optionalEnv("AUTH_STRATEGY", "${authStrategy}")`,
			);
	}

	// Add OAuth env hints when providers are selected
	if (
		filePath === "backend/.env.example" &&
		projectConfig.oauthProviders &&
		projectConfig.oauthProviders.length > 0 &&
		!projectConfig.oauthProviders.includes("none")
	) {
		const oauthLines = projectConfig.oauthProviders
			.filter((p) => p !== "none")
			.map((p) => {
				const upper = p.toUpperCase();
				return `\n# ${p.charAt(0).toUpperCase() + p.slice(1)} OAuth\n${upper}_CLIENT_ID=\n${upper}_CLIENT_SECRET=\n${upper}_REDIRECT_URI=http://localhost:4000/api/auth/callback/${p}`;
			})
			.join("\n");
		return `${content + oauthLines}\n`;
	}

	return content;
}

//  Shared files (fullstack only)

function getSharedFiles(projectConfig: ProjectConfig): ProjectFile[] {
	return [
		{
			path: "shared/package.json",
			content: JSON.stringify(
				{
					name: `${projectConfig.projectName}-shared`,
					version: "0.1.0",
					private: true,
					type: "module",
					exports: {
						".": "./types/index.ts",
					},
				},
				null,
				2,
			),
		},
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

//  CSS helpers

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
			? `@import url("https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700;800&display=swap");\n@import "tailwindcss";\n\n`
			: cssFramework === "bootstrap"
				? `@import url("https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css");\n\n`
				: cssFramework === "sass"
					? `$color-primary: #e11d48;\n$color-background: #050505;\n$color-foreground: #fafafa;\n\n`
					: "";

	return `${cssImport}@theme {
  --font-sans: "Geist", ui-sans-serif, system-ui, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, SFMono-Regular, monospace;
  --color-brand-pink: #e11d48;
  --color-brand-green: #00ff00;
  --color-surface-bg: #000000;
  --color-surface-card: #0d0d0d;
  --color-surface-stroke: #1f1f1f;
}

:root {
  color-scheme: dark;
  background: #050505;
  color: #fafafa;
  font-family: var(--font-sans);
}

* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0;
  min-width: 320px;
  min-height: 100vh;
  background: #050505;
  color: #fafafa;
  overflow-x: hidden;
  -webkit-font-smoothing: antialiased;
}
button, a { font: inherit; }
a { color: inherit; text-decoration: none; }
#rakta-root { min-height: 100vh; }

.rakta-welcome {
  min-height: 100vh;
  background: #050505;
  color: #fafafa;
}
.rakta-shell {
  width: min(100% - 32px, 1280px);
  margin: 0 auto;
  padding: 32px 0;
}
.rakta-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #1f1f1f;
  padding-bottom: 20px;
}
.rakta-hero {
  display: grid;
  min-height: 540px;
  grid-template-columns: minmax(0, 1.08fr) minmax(320px, 0.92fr);
  align-items: center;
  gap: 40px;
  border-bottom: 1px solid #1f1f1f;
  padding: 48px 0;
}
.rakta-hero h1 {
  max-width: 900px;
  margin: 0;
  color: #fff;
  font-size: clamp(3.5rem, 8vw, 6rem);
  font-weight: 900;
  line-height: 0.88;
  letter-spacing: 0;
  text-transform: uppercase;
}
.rakta-hero p,
.rakta-start p {
  color: #b5b5b5;
}
.rakta-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 32px;
}
.rakta-actions a {
  display: inline-flex;
  height: 44px;
  align-items: center;
  gap: 8px;
  border: 1px solid #e11d48;
  padding: 0 20px;
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
}
.rakta-actions a:first-child {
  background: #e11d48;
  color: #fff;
}
.rakta-status-grid,
.rakta-feature-grid {
  display: grid;
  gap: 12px;
  border: 1px solid #1f1f1f;
  background: #0d0d0d;
  padding: 20px;
}
.rakta-status-grid > div,
.rakta-feature-grid > div {
  border: 1px solid rgba(255, 255, 255, 0.06);
  background: #000;
  padding: 16px;
}
.rakta-feature-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0;
  padding: 0;
}
.rakta-feature-grid > div {
  min-height: 220px;
  border-color: #1f1f1f;
  padding: 28px;
}
.rakta-game-section {
  display: grid;
  gap: 20px;
}
.rakta-game-section h2,
.rakta-start h2 {
  margin: 12px 0 0;
  font-size: clamp(2.25rem, 6vw, 4rem);
  font-weight: 900;
  line-height: 0.95;
  text-transform: uppercase;
}
.rakta-game-field {
  position: relative;
  display: block;
  width: 100%;
  height: 280px;
  overflow: hidden;
  border: 2px solid #1f1f1f;
  background: #000;
  color: inherit;
  cursor: pointer;
}
.rakta-game-controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  font-family: var(--font-mono);
  font-size: 10px;
  color: #71717a;
}
.rakta-game-controls button {
  border: 1px solid #1f1f1f;
  padding: 4px 8px;
  color: #a1a1aa;
  cursor: pointer;
}
.rakta-start {
  border-top: 1px solid #1f1f1f;
  padding: 40px 0;
}
.rakta-system-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  border: 1px solid #1f1f1f;
  background: rgba(9, 9, 11, 0.45);
}
.rakta-system-grid > div {
  min-height: 126px;
  border-right: 1px solid #1f1f1f;
  padding: 28px;
}
.rakta-system-grid > div:last-child { border-right: 0; }
.rakta-system-grid span {
  display: block;
  margin-bottom: 10px;
  color: #71717a;
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.14em;
}
.rakta-system-grid strong {
  color: #fff;
  font-family: var(--font-mono);
  font-size: 20px;
}
.rakta-system-grid i {
  display: inline-block;
  width: 10px;
  height: 10px;
  background: #00ff00;
  animation: pulse 1.25s infinite;
}
.rakta-action-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  border-top: 1px solid #1f1f1f;
}
.rakta-action-grid button {
  min-height: 300px;
  border: 0;
  border-right: 1px solid #1f1f1f;
  border-bottom: 1px solid #1f1f1f;
  background: transparent;
  color: #fff;
  cursor: pointer;
  padding: 48px;
  text-align: left;
  transition: background 160ms ease, color 160ms ease;
}
.rakta-action-grid button:last-child { border-right: 0; }
.rakta-action-grid button:hover {
  background: #fff;
  color: #000;
}
.rakta-action-grid span {
  display: block;
  margin-bottom: 40px;
  color: #e11d48;
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.18em;
}
.rakta-action-grid h3 {
  margin: 0 0 16px;
  font-size: 30px;
  font-weight: 900;
  text-transform: uppercase;
}
.rakta-action-grid p {
  min-height: 62px;
  color: #71717a;
  font-size: 12px;
  line-height: 1.7;
}
.rakta-action-grid button:hover p,
.rakta-action-grid button:hover span { color: rgba(0, 0, 0, 0.72); }
.rakta-action-grid b,
.rakta-inline-action,
.rakta-codebar button,
.rakta-deploy-status button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.rakta-footer {
  position: relative;
  overflow: hidden;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  background: #0d0e0f;
  padding: 80px 24px 48px;
}
.rakta-footer > div {
  display: flex;
  width: min(100%, 1280px);
  margin: 0 auto 64px;
  justify-content: space-between;
  gap: 64px;
}
.rakta-footer section {
  max-width: 320px;
}
.rakta-footer h2 {
  margin: 0 0 20px;
  font-family: var(--font-mono);
  font-size: 28px;
}
.rakta-footer p,
.rakta-footer a {
  color: rgba(181, 181, 181, 0.6);
  font-size: 12px;
  line-height: 1.8;
}
.rakta-footer nav {
  display: grid;
  grid-template-columns: repeat(4, minmax(120px, 1fr));
  gap: 36px;
}
.rakta-footer nav div {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.rakta-footer b {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.16em;
}
.rakta-footer > p {
  width: min(100%, 1280px);
  margin: 0 auto;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  padding-top: 32px;
  color: rgba(181, 181, 181, 0.3);
  font-family: var(--font-mono);
  font-size: 10px;
}
.rakta-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: grid;
  place-items: center;
  padding: 16px;
  background: rgba(0, 0, 0, 0.86);
  backdrop-filter: blur(10px);
}
.rakta-modal-panel {
  display: flex;
  width: min(100%, 1040px);
  max-height: 82vh;
  flex-direction: column;
  overflow: hidden;
  border: 2px solid #fff;
  background: #000;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.7);
}
.rakta-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #1f1f1f;
  padding: 20px;
}
.rakta-modal-title {
  display: flex;
  align-items: center;
  gap: 12px;
}
.rakta-modal-title p {
  margin: 0 0 2px;
  color: #e11d48;
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 0.16em;
}
.rakta-modal-title h2 {
  margin: 0;
  font-family: var(--font-mono);
  font-size: 20px;
  text-transform: uppercase;
}
.rakta-icon-button {
  display: grid;
  width: 40px;
  height: 40px;
  place-items: center;
  border: 1px solid #1f1f1f;
  background: #000;
  color: #fff;
  cursor: pointer;
}
.rakta-icon-button:hover {
  background: #e11d48;
}
.rakta-modal-search {
  display: flex;
  align-items: center;
  gap: 10px;
  border-bottom: 1px solid #1f1f1f;
  background: #0d0d0d;
  padding: 12px 16px;
  color: #71717a;
}
.rakta-modal-search input,
.rakta-component-preview input {
  width: 100%;
  border: 1px solid #27272a;
  background: #000;
  color: #fff;
  padding: 10px 12px;
  outline: 0;
}
.rakta-modal-split {
  display: grid;
  min-height: 480px;
  grid-template-columns: 280px minmax(0, 1fr);
  overflow: hidden;
}
.rakta-modal-split aside {
  overflow: auto;
  border-right: 1px solid #1f1f1f;
  background: #080808;
}
.rakta-modal-split aside button {
  display: block;
  width: 100%;
  border: 0;
  border-bottom: 1px solid #1f1f1f;
  background: transparent;
  color: #a1a1aa;
  cursor: pointer;
  padding: 16px;
  text-align: left;
}
.rakta-modal-split aside button.is-active {
  background: #e11d48;
  color: #fff;
}
.rakta-modal-split aside span {
  display: block;
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
}
.rakta-modal-split aside small {
  display: block;
  margin-top: 4px;
  color: currentColor;
  opacity: 0.68;
}
.rakta-modal-split article {
  overflow: auto;
  padding: 32px;
}
.rakta-modal-split article h3 {
  margin: 12px 0 18px;
  font-size: 32px;
  font-weight: 900;
  text-transform: uppercase;
}
.rakta-modal-split article p {
  color: #d4d4d8;
  font-size: 14px;
  line-height: 1.8;
}
.rakta-chip {
  display: inline-flex;
  border: 1px solid rgba(225, 29, 72, 0.35);
  color: #e11d48;
  padding: 4px 8px;
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.14em;
}
.rakta-inline-action {
  margin-top: 32px;
  border: 1px solid #fff;
  background: #000;
  color: #fff;
  cursor: pointer;
  padding: 10px 14px;
}
.rakta-component-preview {
  display: grid;
  min-height: 160px;
  place-items: center;
  border: 1px solid #1f1f1f;
  background-image:
    linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px);
  background-size: 40px 40px;
  margin: 24px 0;
  padding: 32px;
}
.rakta-component-preview button:first-child,
.rakta-deploy-status button {
  border: 1px solid #e11d48;
  background: #e11d48;
  color: #fff;
  cursor: pointer;
  padding: 12px 18px;
}
.rakta-live-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 1px solid rgba(16, 185, 129, 0.4);
  color: #34d399;
  padding: 8px 12px;
  font-family: var(--font-mono);
  font-size: 12px;
}
.rakta-live-badge span {
  width: 8px;
  height: 8px;
  background: #10b981;
  border-radius: 99px;
  animation: pulse 1s infinite;
}
.rakta-toggle-preview {
  width: 64px;
  height: 32px;
  border: 2px solid #fff !important;
  background: #18181b !important;
  padding: 2px !important;
}
.rakta-toggle-preview span {
  display: block;
  width: 24px;
  height: 24px;
  background: #fff;
}
.rakta-codebar,
.rakta-deploy-status {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border: 1px solid #1f1f1f;
  background: #0d0d0d;
  padding: 12px 16px;
}
.rakta-codebar span {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #71717a;
  font-family: var(--font-mono);
  font-size: 10px;
}
.rakta-codebar button {
  border: 0;
  background: transparent;
  color: #e11d48;
  cursor: pointer;
}
.rakta-modal-panel pre {
  overflow: auto;
  margin: 0;
  border: 1px solid #1f1f1f;
  border-top: 0;
  background: #0d0d0d;
  color: #00ff00;
  padding: 16px;
  font-family: var(--font-mono);
  font-size: 12px;
}
.rakta-deploy-status span {
  display: block;
  color: #71717a;
  font-family: var(--font-mono);
  font-size: 10px;
}
.rakta-deploy-status strong {
  display: block;
  margin-top: 4px;
  color: #fff;
  font-family: var(--font-mono);
  font-size: 14px;
}
.rakta-terminal {
  min-height: 420px;
  overflow: auto;
  padding: 24px;
  background: #000;
  color: #d4d4d8;
  font-family: var(--font-mono);
  font-size: 12px;
}
.rakta-terminal p {
  margin: 0 0 10px;
}
.rakta-terminal p:first-child,
.rakta-terminal p:last-child,
.rakta-terminal strong {
  color: #00ff00;
}
.rakta-terminal em {
  display: block;
  margin-top: 48px;
  color: #52525b;
  text-align: center;
}
.rakta-deploy-success {
  display: flex;
  gap: 12px;
  border: 1px solid #00ff00;
  background: rgba(16, 185, 129, 0.08);
  color: #00ff00;
  margin-top: 24px;
  padding: 16px;
}
.rakta-deploy-success span {
  display: block;
  margin-top: 6px;
  color: #fff;
}

@media (max-width: 768px) {
  .rakta-hero,
  .rakta-feature-grid,
  .rakta-system-grid,
  .rakta-action-grid,
  .rakta-modal-split {
    grid-template-columns: 1fr;
  }
  .rakta-system-grid > div,
  .rakta-action-grid button,
  .rakta-modal-split aside {
    border-right: 0;
  }
  .rakta-footer > div,
  .rakta-codebar,
  .rakta-deploy-status {
    flex-direction: column;
    align-items: stretch;
  }
  .rakta-footer nav {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .rakta-nav > div:last-child {
    display: none;
  }
}

::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: #000000; }
::-webkit-scrollbar-thumb { background: #e11d48; border-radius: 0; }
::-webkit-scrollbar-thumb:hover { background: #be123c; }

@keyframes scanline {
  0% { transform: translateY(-100%); }
  100% { transform: translateY(100vh); }
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.35; }
}
.scanline {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 999;
  width: 100%;
  height: 120px;
  pointer-events: none;
  background: linear-gradient(0deg, rgba(225, 29, 72, 0.08) 0%, rgba(225, 29, 72, 0) 100%);
  opacity: 0.8;
  animation: scanline 8s linear infinite;
}

.bg-grid-glow {
  background-size: 40px 40px;
  background-image:
    linear-gradient(to right, rgba(255, 255, 255, 0.04) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255, 255, 255, 0.04) 1px, transparent 1px);
}

@keyframes seaweed-wave-1 {
  0% { transform: skewX(-14deg) rotate(-8deg) scaleY(0.96); }
  50% { transform: skewX(0deg) rotate(0deg) scaleY(1.04); }
  100% { transform: skewX(14deg) rotate(8deg) scaleY(0.96); }
}
@keyframes seaweed-wave-2 {
  0% { transform: skewX(10deg) rotate(6deg) scaleY(1.04); }
  50% { transform: skewX(-2deg) rotate(-2deg) scaleY(0.96); }
  100% { transform: skewX(-10deg) rotate(-6deg) scaleY(1.04); }
}
.seaweed-waving-left-1,
.seaweed-waving-right-1 {
  transform-origin: bottom center !important;
  animation: seaweed-wave-1 3.2s infinite ease-in-out alternate !important;
}
.seaweed-waving-left-2,
.seaweed-waving-right-2 {
  transform-origin: bottom center !important;
  animation: seaweed-wave-2 3.8s infinite ease-in-out alternate !important;
}

`;
}

// ─── Inline template generators

function generateFrontendOnlyRaktaEnv(): string {
	return `import "react";

declare module "*.css";
declare module "*.scss";
declare module "*.sass";

// Rakta.js built-in anchor component - use <Click to="/path"> instead of <a href>
type RaktaClickAttributes = Omit<
  import("react").AnchorHTMLAttributes<HTMLElement>,
  "href"
> & {
  readonly to: string;
};

// Rakta.js built-in image component - use <Picture path="..."> instead of <img>
type RaktaPhotoAttributes = Omit<
  import("react").ImgHTMLAttributes<HTMLImageElement>,
  "src"
> & {
  readonly path: string;
  readonly alt: string;
};

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      // Rakta.js SPA anchor: client-side routing without full page reload
      click: RaktaClickAttributes;
      // Rakta.js image: lazy loading, blur placeholder, responsive sizing
      photo: RaktaPhotoAttributes;
      // Rakta.js official image tag; supported when a path attribute is present.
      picture: RaktaPhotoAttributes;
      // Rakta.js smooth scroll trigger: navigates to <reborns id=""> target
      pantura: Omit<import("react").AnchorHTMLAttributes<HTMLElement>, "href"> & {
        readonly to: string;
        readonly offset?: number;
        readonly duration?: number;
        readonly easing?: string;
        readonly updateHash?: boolean;
        readonly activeClassName?: string;
      };
      // Rakta.js scroll target marker: receives <pantura to=""> navigation
      reborns: import("react").HTMLAttributes<HTMLElement> & {
        readonly id: string;
      };
      // Rakta.js deferred rendering boundary: wraps Suspense with optional delay
      lazy: import("raktajs/components").LazyProps;
      // Rakta.js authorization boundary: conditionally renders based on permission
      guard: import("raktajs/components").GuardProps;
      // Rakta.js error boundary: catches runtime component errors safely
      seal: import("raktajs/components").SealProps;
      // Rakta.js form wrapper: injects hidden CSRF token automatically
      form: import("react").FormHTMLAttributes<HTMLFormElement> & {
        readonly csrfToken?: string;
      };
      // Rakta.js declarative document title: updates document.title from any component
      title: {
        readonly children?: import("react").ReactNode;
        readonly text?: string;
      };
      // Rakta.js state persistence boundary: syncs state to localStorage
      shelf: import("raktajs/components").ShelfProps<unknown>;
      // Rakta.js client/hydration island boundary
      island: import("raktajs/components").IslandProps;
      // Rakta.js route/resource prefetch hint
      prefetch: import("raktajs/components").PrefetchProps;
      // Rakta.js route-state boundary
      route: import("raktajs/components").RouteProps;
      // Rakta.js declarative resource hint
      resource: import("raktajs/components").ResourceProps;
    }
  }
}

declare global {
  type AestheticUnit = "LENIS-MODERN" | "RETRO-CYBER" | "NEO-BRUTALIST";
  type ReactNode = import("react").ReactNode;

  const useCallback: typeof import("react").useCallback;
  const useEffect: typeof import("react").useEffect;
  const useMemo: typeof import("react").useMemo;
  const useRef: typeof import("react").useRef;
  const useState: typeof import("react").useState;

  const gsap: typeof import("gsap").default;

  const RaktaToast: typeof import("raktajs/components").RaktaToast;
  const Toaster: typeof import("raktajs/components").Toaster;
  const RaktaAlert: typeof import("raktajs/components").RaktaAlert;
  const Alert: typeof import("raktajs/components").Alert;
  const Click: typeof import("raktajs/components").Click;
  const click: typeof import("raktajs/components").Click;
  const Photo: typeof import("raktajs/components").Picture;
  const photo: typeof import("raktajs/components").Picture;
  const Picture: typeof import("raktajs/components").Picture;
  const Lazy: typeof import("raktajs/components").Lazy;
  const Guard: typeof import("raktajs/components").Guard;
  const Seal: typeof import("raktajs/components").Seal;
  const Form: typeof import("raktajs/components").Form;
  const Title: typeof import("raktajs/components").Title;
  const Shelf: typeof import("raktajs/components").Shelf;
  const Island: typeof import("raktajs/components").Island;
  const Prefetch: typeof import("raktajs/components").Prefetch;
  const Route: typeof import("raktajs/components").Route;
  const Resource: typeof import("raktajs/components").Resource;
  const Pantura: typeof import("raktajs/components").Pantura;
  const Reborns: typeof import("raktajs/components").Reborns;
  const usePantura: typeof import("raktajs/components").usePantura;
  const toast: typeof import("raktajs/components").toast;
  const useToast: typeof import("raktajs/components").useToast;

  type IconComponent = import("react").ComponentType<{ className?: string; style?: import("react").CSSProperties }>;

  const ArrowRight: IconComponent;
  const Book: IconComponent;
  const Check: IconComponent;
  const CheckCircle2: IconComponent;
  const Cloud: IconComponent;
  const Code: IconComponent;
  const Copy: IconComponent;
  const Cpu: IconComponent;
  const Github: IconComponent;
  const Info: IconComponent;
  const Play: IconComponent;
  const RotateCcw: IconComponent;
  const Search: IconComponent;
  const Server: IconComponent;
  const Terminal: IconComponent;
  const Volume2: IconComponent;
  const VolumeX: IconComponent;
  const X: IconComponent;

  const FaArrowRight: IconComponent;
  const FaArrowRotateRight: IconComponent;
  const FaBook: IconComponent;
  const FaCheck: IconComponent;
  const FaCircleCheck: IconComponent;
  const FaCloud: IconComponent;
  const FaCode: IconComponent;
  const FaCopy: IconComponent;
  const FaHandHoldingHeart: IconComponent;
  const FaHeart: IconComponent;
  const FaMagnifyingGlass: IconComponent;
  const FaMicrochip: IconComponent;
  const FaPlay: IconComponent;
  const FaRibbon: IconComponent;
  const FaXmark: IconComponent;

  const CoralObstacle: import("react").ComponentType<Record<string, unknown>>;
  const ShrimpCharacter: import("react").ComponentType<Record<string, unknown>>;

  const getMuteState: () => boolean;
  const playGameOverSound: () => void;
  const playJumpSound: () => void;
  const playScoreSound: () => void;
  const setMute: (muted: boolean) => void;
}
`;
}

function generateFrontendOnlyLayout(): string {
	return `interface RootLayoutProps {
  readonly children: import("react").ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html  lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="Built with Rakta.js - Small in size. Fierce in speed. Alive in every route." />
        <title>${DEFAULT_METADATA_TITLE}</title>
        <link rel="icon" href="/favicon.ico?v=rakta" sizes="any" type="image/x-icon" />
        <link rel="shortcut icon" href="/favicon.ico?v=rakta" type="image/x-icon" />
        <link rel="apple-touch-icon" href="/favicon.ico?v=rakta" />
      </head>
      <body className="min-h-screen bg-[#050505] text-slate-50 antialiased">
        {children}
      </body>
    </html>
  );
}
`;
}

function generateFrontendOnlyPage(_projectName: string): string {
	return STARTER_PAGE_CODE;
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
        <Click
          to="/"
          className="font-semibold text-red-500 underline-offset-4 transition hover:text-red-400 hover:underline"
        >
          Return home
        </Click>
      </section>
    </main>
  );
}
`;
}

function _generateShrimpMascotComponent(): string {
	return `interface RaktaShrimpMascotProps {
  readonly isJumping: boolean;
  readonly isDead: boolean;
  readonly style?: import("react").CSSProperties;
}

/**
 * RaktaShrimpMascot - The animated shrimp hero of ShrimpRun.
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

function _generateShrimpRunGameComponent(): string {
	return `import { useCallback, useEffect, useRef, useState } from "react";
import RaktaShrimpMascot from "./raktaShrimpMascot";
//  Types

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

//  Constants

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

//  Physics helpers

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

//  Component

/**
 * ShrimpRun - Default Rakta.js interactive starter game.
 *
 * Like the Chrome offline Dino game, but the dinosaur is an animated shrimp.
 * Press Space or click the game canvas to jump. Avoid the red obstacles!
 *
 * Features:
 * - React state only - no external game library
 * - requestAnimationFrame game loop
 * - Physics: gravity + jump velocity
 * - Score that increases over time
 * - Speed ramps up as score grows
 * - Collision detection with margin
 * - High score tracked in component state
 * - Keyboard (Space) and click/tap support
 * - Accessible button game canvas
 * - SVG shrimp mascot - no external assets
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
          className="absolute shrimp-sprite"
          style={{
            left: SHRIMP_START_X,
            bottom: shrimpBottomOffset,
            width: SHRIMP_WIDTH,
            height: SHRIMP_HEIGHT,
            transform: isDead
              ? "rotate(18deg) translateY(8px)"
              : shrimp.isJumping
                ? "rotate(-8deg) translateY(-4px)"
                : "rotate(0deg)",
            transition: "transform 120ms ease",
          }}
        >
          <RaktaShrimpMascot isJumping={shrimp.isJumping} isDead={isDead} />
        </span>

        {obstacles.map((obstacle) => (
          <span
            key={obstacle.id}
            className="absolute shrimp-run-obstacle"
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
        {isIdle && "ðŸ¦ Click or press Space to make the shrimp jump!"}
        {isRunning && "ðŸ¦ Don't hit the obstacles!"}
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
	return `export default function HomePage() {
  return (
    <main className="page-shell">
      <section className="hero-card">
        <p className="eyebrow">THE RED ROUTER FRAMEWORK</p>
        <h1>Welcome to ${projectName}</h1>
        <p>
          Built with Rakta.js - Small in size. Fierce in speed. Alive in every route.
        </p>
        <div className="button-row">
          <Click to="/about">About</Click>
          <Click to="/blog">Blog</Click>
        </div>
      </section>
    </main>
  );
}
`;
}

//  Database helpers

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

//  README

function generateProjectReadme(projectConfig: ProjectConfig): string {
	const { projectName, projectMode } = projectConfig;

	if (projectMode === "frontend-only") {
		return `# ${projectName}\n\nBuilt with Rakta.js - Small in size. Fierce in speed. Alive in every route.\n\n## Stack\n\n| Layer | Technology |\n| --- | --- |\n| Frontend | Rakta.js + React + TypeScript |\n| CSS | ${CSS_DISPLAY[projectConfig.cssFramework]} |\n| Runtime | Bun |\n\n## Run\n\n\`\`\`bash\nbun run dev\n\`\`\`\n\nDependencies are installed automatically during project creation. If you created the project with \`--no-install\`, run \`bun install\` once before starting development.\n\n## ShrimpRun\n\nYour starter includes ShrimpRun - an interactive game where a shrimp dodges obstacles. Press Space or click to jump!\n`;
	}

	return `# ${projectName}\n\nBuilt with Rakta.js - Small in size. Fierce in speed. Alive in every route.\n\n## Stack\n\n| Layer | Technology |\n| --- | --- |\n| Frontend | Rakta.js + React + TypeScript |\n| CSS | ${CSS_DISPLAY[projectConfig.cssFramework]} |\n| Backend | ${BACKEND_DISPLAY[projectConfig.backendFramework]} |\n| Database | ${DATABASE_DISPLAY[projectConfig.database]} |\n| Runtime | Bun |\n\n## Run\n\n\`\`\`bash\n# Frontend + backend in one command\nbun run dev\n\n# Or separately:\nbun run dev:frontend\nbun run dev:backend\n\`\`\`\n\nDependencies are installed automatically during project creation. If you created the project with \`--no-install\`, run \`bun install\` once before starting development.\n\n## Endpoints\n\n- Frontend: http://localhost:3000\n- Backend: http://localhost:4000\n`;
}

//  Main export

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
