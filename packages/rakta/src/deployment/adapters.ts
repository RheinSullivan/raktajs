/**
 * Rakta.js Deployment Adapters.
 *
 * Architecture:
 *   Framework Build  →  platform-neutral BuildManifest
 *       ↓
 *   Deployment Adapter  →  platform-specific artifacts
 *
 * Each adapter consumes the BuildManifest and emits the files / config the
 * platform expects. Config-only adapters (e.g. Railway) generate start scripts
 * and reference real build artifacts. They do NOT claim a deployment is working
 * unless the referenced artifacts actually exist.
 *
 * Vercel uses the Build Output API v3 (.vercel/output/).
 * Netlify uses netlify.toml + _redirects + Netlify Functions for SSR.
 * Cloudflare Pages (static) or Workers (SSR).
 * Railway / Render / Fly / Docker use the generic Node/Bun server entry.
 */

import { RAKTA_NAME, RAKTA_VERSION } from "../frameworkIdentity";
import type {
	DeploymentAdapter,
	DeploymentAdapterOptions,
	DeploymentTarget,
} from "./types";

const TARGET_LABELS: Record<DeploymentTarget, string> = {
	node: "Node.js",
	bun: "Bun",
	deno: "Deno",
	"cloudflare-workers": "Cloudflare Workers",
	"cloudflare-pages": "Cloudflare Pages",
	netlify: "Netlify",
	vercel: "Vercel",
	docker: "Docker",
	"aws-lambda": "AWS Lambda",
	fly: "Fly.io",
	railway: "Railway",
	render: "Render",
	firebase: "Firebase Hosting",
	"github-pages": "GitHub Pages",
	static: "Static Export",
};

function base(
	options: DeploymentAdapterOptions,
): Required<DeploymentAdapterOptions> {
	return {
		appName: options.appName,
		outDir: options.outDir ?? "dist",
		serverEntry: options.serverEntry ?? "dist/server/index.js",
		staticDir: options.staticDir ?? "dist",
		port: options.port ?? 3000,
		rendering: options.rendering ?? "csr",
	};
}

// ─── Vercel Build Output API v3 ────────────────────────────────────────────
//
// Reference: https://vercel.com/docs/build-output-api/v3
//
// The .vercel/output/ structure:
//
//   .vercel/output/
//   ├── config.json           { "version": 3 }
//   ├── static/               static assets served at their URL path
//   │   ├── index.html
//   │   ├── app.js
//   │   ├── app.css
//   │   └── ...
//   └── functions/            serverless / edge functions (SSR only)
//       └── index.func/
//           ├── .vc-config.json
//           └── index.js
//
// CSR / SSG:
//   All files from dist/ (or dist/client/ for SSR split) are copied to
//   .vercel/output/static/. Vercel serves them as static assets.
//   A catch-all route rewrite ensures the SPA gets index.html for every path.
//
// SSR:
//   Client assets go to .vercel/output/static/client/.
//   The server entry (dist/server/index.js) is wrapped in a Vercel Function.
//   config.json includes a catch-all route pointing to the function.
//
// The adapter emits the files / config that Rakta.js will write after build.
// The build pipeline (forge/build.ts) calls this adapter to know where to copy.

function buildVercelAdapter(
	resolved: Required<DeploymentAdapterOptions>,
): DeploymentAdapter {
	const isSSR =
		resolved.rendering === "ssr" ||
		resolved.rendering === "streaming_ssr" ||
		resolved.rendering === "edge" ||
		resolved.rendering === "isr";

	if (isSSR) {
		// SSR: Vercel Function wrapping the Rakta server entry
		const vcFunctionConfig = {
			runtime: "nodejs20.x",
			handler: "index.js",
			launcherType: "Nodejs",
			shouldAddHelpers: true,
		};

		// This is the Vercel Function wrapper that adapts the Node/Bun server to
		// the Vercel serverless function contract (req/res → Web Fetch API).
		const functionWrapper = `
const { createRaktaRequestHandler } = await import("raktajs/runtime/server");
const { loadConfig } = await import("raktajs/config");
const path = await import("node:path");

const cwd = process.cwd();
const config = await loadConfig(cwd);

const handler = createRaktaRequestHandler({
  projectRoot: cwd,
  appDir: path.join(cwd, config.appDir),
  publicDir: path.join(cwd, config.publicDir),
  outDir: path.join(cwd, config.build.outDir ?? "dist"),
  appName: config.appName,
  seo: config.seo,
  renderConfig: config.render,
});

export default async function (request) {
  return handler(request);
}
`.trim();

		return {
			target: "vercel",
			label: TARGET_LABELS.vercel,
			runtime: "edge",
			buildCommand: "bun run build",
			outputDirectory: ".vercel/output",
			environment: { NODE_ENV: "production" },
			files: [
				{
					path: ".vercel/output/config.json",
					content: JSON.stringify(
						{
							version: 3,
							routes: [
								// Serve static assets directly with immutable cache headers
								{
									src: "^/client/chunks/(.*)$",
									headers: {
										"cache-control": "public, max-age=31536000, immutable",
									},
									continue: true,
								},
								// Catch-all: SSR function handles everything else
								{
									src: "/(.*)",
									dest: "/index.func",
								},
							],
						},
						null,
						2,
					),
				},
				{
					path: ".vercel/output/functions/index.func/.vc-config.json",
					content: JSON.stringify(vcFunctionConfig, null, 2),
				},
				{
					path: ".vercel/output/functions/index.func/index.js",
					content: functionWrapper,
				},
				{
					path: ".vercel/project.json",
					content: JSON.stringify(
						{ framework: "raktajs", buildOutputPath: ".vercel/output" },
						null,
						2,
					),
				},
			],
		};
	}

	// CSR / SSG: all output files go into .vercel/output/static/
	// The SPA rewrite ensures index.html is served for every unmatched path.
	return {
		target: "vercel",
		label: TARGET_LABELS.vercel,
		runtime: "static",
		buildCommand: "bun run build",
		outputDirectory: ".vercel/output",
		environment: { NODE_ENV: "production" },
		files: [
			{
				path: ".vercel/output/config.json",
				content: JSON.stringify(
					{
						version: 3,
						routes: [
							// Serve hashed assets with long-lived immutable cache
							{
								src: "^/chunks/(.+\\.[a-f0-9]{8,}\\.(js|css))$",
								headers: {
									"cache-control": "public, max-age=31536000, immutable",
								},
								continue: true,
							},
							// Explicit static files are served as-is
							{
								handle: "filesystem",
							},
							// SPA fallback: any unmatched path → index.html
							{
								src: "/(.*)",
								dest: "/index.html",
							},
						],
					},
					null,
					2,
				),
			},
			{
				// This file tells Vercel about the framework so it shows in the dashboard.
				path: ".vercel/project.json",
				content: JSON.stringify(
					{ framework: "raktajs", buildOutputPath: ".vercel/output" },
					null,
					2,
				),
			},
		],
	};
}

// ─── Netlify ────────────────────────────────────────────────────────────────
//
// For CSR/SSG: netlify.toml + _redirects for SPA fallback.
// For SSR: Netlify Functions wrapping the Rakta server entry.
//
// Reference: https://docs.netlify.com/configure-builds/file-based-configuration/

function buildNetlifyAdapter(
	resolved: Required<DeploymentAdapterOptions>,
): DeploymentAdapter {
	const isSSR =
		resolved.rendering === "ssr" ||
		resolved.rendering === "streaming_ssr" ||
		resolved.rendering === "edge" ||
		resolved.rendering === "isr";

	const publishDir = isSSR ? `${resolved.outDir}/client` : resolved.outDir;

	const netlifyToml = isSSR
		? `# Generated by Rakta.js ${RAKTA_VERSION}
[build]
  command = "bun run build"
  publish = "${publishDir}"
  functions = "${resolved.outDir}/netlify-functions"

[build.environment]
  NODE_ENV = "production"
  RAKTA_FRAMEWORK = "raktajs"

[[headers]]
  for = "/*"
  [headers.values]
    X-Powered-By = "${RAKTA_NAME}"
    X-Generator = "${RAKTA_NAME}/${RAKTA_VERSION}"
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"

[[headers]]
  for = "/chunks/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[redirects]]
  from = "/*"
  to = "/.netlify/functions/server"
  status = 200
`
		: `# Generated by Rakta.js ${RAKTA_VERSION}
[build]
  command = "bun run build"
  publish = "${publishDir}"

[build.environment]
  NODE_ENV = "production"
  RAKTA_FRAMEWORK = "raktajs"

[[headers]]
  for = "/*"
  [headers.values]
    X-Powered-By = "${RAKTA_NAME}"
    X-Generator = "${RAKTA_NAME}/${RAKTA_VERSION}"
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"

[[headers]]
  for = "/chunks/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
`;

	const files: { path: string; content: string }[] = [
		{ path: "netlify.toml", content: netlifyToml },
		{
			path: `${publishDir}/_redirects`,
			content: isSSR
				? `# Rakta.js SSR - route all traffic through the Netlify Function\n/*  /.netlify/functions/server  200\n`
				: `# Rakta.js SPA fallback - all unmatched paths serve index.html\n/*  /index.html  200\n`,
		},
	];

	if (isSSR) {
		// Netlify Function wrapper for the Rakta server entry
		files.push({
			path: `${resolved.outDir}/netlify-functions/server.js`,
			content: `// Netlify Function - Rakta.js SSR adapter
// This file is auto-generated by Rakta.js. Do not edit manually.
import { createRaktaRequestHandler } from "raktajs/runtime/server";
import { loadConfig } from "raktajs/config";
import path from "node:path";

const cwd = process.cwd();
const config = await loadConfig(cwd);

const handler = createRaktaRequestHandler({
  projectRoot: cwd,
  appDir: path.join(cwd, config.appDir),
  publicDir: path.join(cwd, config.publicDir),
  outDir: path.join(cwd, ${JSON.stringify(resolved.outDir)}),
  appName: config.appName,
  seo: config.seo,
  renderConfig: config.render,
});

export async function handler(event, context) {
  const url = new URL(event.rawUrl);
  const request = new Request(url.toString(), {
    method: event.httpMethod,
    headers: event.headers,
    body: event.httpMethod !== "GET" && event.httpMethod !== "HEAD"
      ? event.body
      : undefined,
  });
  const response = await handler(request);
  const body = await response.text();
  return {
    statusCode: response.status,
    headers: Object.fromEntries(response.headers.entries()),
    body,
  };
}
`,
		});
	}

	return {
		target: "netlify",
		label: TARGET_LABELS.netlify,
		runtime: isSSR ? "edge" : "static",
		buildCommand: "bun run build",
		outputDirectory: publishDir,
		environment: { NODE_ENV: "production" },
		files,
	};
}

// ─── Cloudflare ─────────────────────────────────────────────────────────────
//
// CSR/SSG → Cloudflare Pages (static output)
// SSR     → Cloudflare Workers (edge Worker)
//
// Note: Cloudflare Workers do NOT support Node.js APIs directly.
// The SSR adapter generates a Worker that uses the Web Fetch API only.

function buildCloudflareAdapter(
	resolved: Required<DeploymentAdapterOptions>,
	target: "cloudflare-workers" | "cloudflare-pages",
): DeploymentAdapter {
	const isSSR =
		resolved.rendering === "ssr" ||
		resolved.rendering === "streaming_ssr" ||
		resolved.rendering === "edge" ||
		resolved.rendering === "isr";

	if (target === "cloudflare-workers" || isSSR) {
		// Cloudflare Worker - must use Web APIs only (no Node.js built-ins)
		const workerScript = `// Rakta.js Cloudflare Worker - SSR adapter
// Generated by ${RAKTA_NAME} v${RAKTA_VERSION}
// WARNING: This worker uses Web Fetch API only. Node.js APIs are not available.

const CRITICAL_CSS = "#rakta-root{min-height:100vh}";

function buildHtmlShell(title, scriptPath, cssPath) {
  return \`<!DOCTYPE html>
<html lang="en" data-framework="raktajs">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>\${title}</title>
    <link rel="preload" href="\${cssPath}" as="style" />
    <link rel="modulepreload" href="\${scriptPath}" />
    <link rel="stylesheet" href="\${cssPath}" />
    <style>\${CRITICAL_CSS}</style>
  </head>
  <body>
    <div id="rakta-root" data-rakta="true"></div>
    <script type="module" src="\${scriptPath}"></script>
  </body>
</html>\`;
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const { pathname } = url;

    // Static assets are served by Cloudflare Pages if deployed alongside Workers.
    // For pure Workers deployment, assets are expected to be served separately
    // or bundled into the Worker via the assets binding.

    const html = buildHtmlShell(
      ${JSON.stringify(resolved.appName)},
      "/client/app.js",
      "/client/app.css"
    );

    return new Response(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "X-Powered-By": "${RAKTA_NAME}",
      },
    });
  },
};
`;

		return {
			target,
			label: TARGET_LABELS[target],
			runtime: "edge",
			buildCommand: "bun run build",
			outputDirectory: resolved.outDir,
			environment: { NODE_ENV: "production" },
			files: [
				{
					path: "wrangler.toml",
					content: `# Generated by Rakta.js ${RAKTA_VERSION}
name = "${resolved.appName.toLowerCase().replace(/[^a-z0-9-]/g, "-")}"
main = "${resolved.outDir}/worker.js"
compatibility_date = "2024-01-01"
compatibility_flags = ["nodejs_compat"]

[site]
bucket = "${resolved.outDir}/client"
`,
				},
				{
					path: `${resolved.outDir}/worker.js`,
					content: workerScript,
				},
			],
		};
	}

	// Cloudflare Pages - static output
	return {
		target: "cloudflare-pages",
		label: TARGET_LABELS["cloudflare-pages"],
		runtime: "static",
		buildCommand: "bun run build",
		outputDirectory: resolved.outDir,
		environment: { NODE_ENV: "production" },
		files: [
			{
				path: `${resolved.outDir}/_headers`,
				content: `# Rakta.js Cloudflare Pages headers
/chunks/*
  Cache-Control: public, max-age=31536000, immutable
/*
  X-Powered-By: ${RAKTA_NAME}
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
`,
			},
			{
				path: `${resolved.outDir}/_redirects`,
				content: `# Rakta.js SPA fallback
/*  /index.html  200
`,
			},
		],
	};
}

// ─── Generic Node / Bun server ──────────────────────────────────────────────
//
// Used by: Railway, Render, Fly.io, Docker, generic Node/Bun servers.
// These platforms run a long-lived server process. They all use the same
// generated server entry (dist/server/index.js) via `bun run start`.

function buildGenericServerAdapter(
	resolved: Required<DeploymentAdapterOptions>,
	target: DeploymentTarget,
	runtime: "bun" | "node",
): DeploymentAdapter {
	const startCmd =
		runtime === "bun"
			? `bun run ${resolved.serverEntry}`
			: `node ${resolved.serverEntry}`;

	const label = TARGET_LABELS[target] ?? "Generic Server";

	return {
		target,
		label,
		runtime,
		buildCommand: "bun run build",
		startCommand: startCmd,
		outputDirectory: resolved.outDir,
		environment: {
			NODE_ENV: "production",
			PORT: String(resolved.port),
		},
		files: [],
	};
}

// ─── Docker ─────────────────────────────────────────────────────────────────

function buildDockerAdapter(
	resolved: Required<DeploymentAdapterOptions>,
): DeploymentAdapter {
	const dockerfile = `# Rakta.js Production Docker Image
# Generated by ${RAKTA_NAME} v${RAKTA_VERSION}
# Build: docker build -t ${resolved.appName.toLowerCase().replace(/[^a-z0-9-]/g, "-")} .
# Run:   docker run -p ${resolved.port}:${resolved.port} ${resolved.appName.toLowerCase().replace(/[^a-z0-9-]/g, "-")}

FROM oven/bun:1 AS builder

WORKDIR /app

# Install dependencies
COPY package*.json bun.lock* ./
RUN bun install --frozen-lockfile

# Copy source and build
COPY . .
RUN bun run build

# Production image - only copy the build output and production deps
FROM oven/bun:1-slim AS production

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=${resolved.port}

# Copy only what's needed to run
COPY --from=builder /app/${resolved.outDir} ./${resolved.outDir}
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/bun.lock* ./
COPY --from=builder /app/rakta.config.ts ./

# Install only production dependencies
RUN bun install --frozen-lockfile --production

EXPOSE ${resolved.port}

CMD ["bun", "run", "${resolved.serverEntry}"]
`;

	const dockerignore = `node_modules
.git
.rakta
.tmp
*.log
`;

	return {
		target: "docker",
		label: TARGET_LABELS.docker,
		runtime: "bun",
		buildCommand: "docker build .",
		startCommand: `docker run -p ${resolved.port}:${resolved.port} ${resolved.appName.toLowerCase().replace(/[^a-z0-9-]/g, "-")}`,
		outputDirectory: resolved.outDir,
		environment: {
			NODE_ENV: "production",
			PORT: String(resolved.port),
		},
		files: [
			{ path: "Dockerfile", content: dockerfile },
			{ path: ".dockerignore", content: dockerignore },
		],
	};
}

// ─── Static Export ───────────────────────────────────────────────────────────

function buildStaticAdapter(
	resolved: Required<DeploymentAdapterOptions>,
): DeploymentAdapter {
	return {
		target: "static",
		label: TARGET_LABELS.static,
		runtime: "static",
		buildCommand: "bun run build",
		outputDirectory: resolved.staticDir,
		environment: { NODE_ENV: "production" },
		files: [],
	};
}

// ─── GitHub Pages ────────────────────────────────────────────────────────────

function buildGitHubPagesAdapter(
	resolved: Required<DeploymentAdapterOptions>,
): DeploymentAdapter {
	return {
		target: "github-pages",
		label: TARGET_LABELS["github-pages"],
		runtime: "static",
		buildCommand: "bun run build",
		outputDirectory: resolved.staticDir,
		environment: { NODE_ENV: "production" },
		files: [
			{
				// GitHub Pages requires a .nojekyll file so that assets in _* dirs are served.
				path: `${resolved.staticDir}/.nojekyll`,
				content: "",
			},
		],
	};
}

// ─── AWS Lambda ──────────────────────────────────────────────────────────────

function buildAwsLambdaAdapter(
	resolved: Required<DeploymentAdapterOptions>,
): DeploymentAdapter {
	const lambdaHandler = `// Rakta.js AWS Lambda Handler
// Generated by ${RAKTA_NAME} v${RAKTA_VERSION}

import { createRaktaRequestHandler } from "raktajs/runtime/server";
import { loadConfig } from "raktajs/config";
import path from "node:path";

const cwd = process.cwd();
const config = await loadConfig(cwd);

const handler = createRaktaRequestHandler({
  projectRoot: cwd,
  appDir: path.join(cwd, config.appDir),
  publicDir: path.join(cwd, config.publicDir),
  outDir: path.join(cwd, ${JSON.stringify(resolved.outDir)}),
  appName: config.appName,
  seo: config.seo,
  renderConfig: config.render,
});

export async function handler(event) {
  const url = new URL(event.rawPath, "https://lambda.amazonaws.com");
  const request = new Request(url.toString(), {
    method: event.requestContext.http.method,
    headers: event.headers,
  });
  const response = await handler(request);
  const body = await response.text();
  return {
    statusCode: response.status,
    headers: Object.fromEntries(response.headers.entries()),
    body,
    isBase64Encoded: false,
  };
}
`;

	return {
		target: "aws-lambda",
		label: TARGET_LABELS["aws-lambda"],
		runtime: "node",
		buildCommand: "bun run build",
		outputDirectory: resolved.outDir,
		environment: { NODE_ENV: "production" },
		files: [
			{
				path: `${resolved.outDir}/lambda-handler.mjs`,
				content: lambdaHandler,
			},
		],
	};
}

// ─── Public API ─────────────────────────────────────────────────────────────

/**
 * Creates a deployment adapter for the specified target.
 *
 * The adapter describes the files and configuration Rakta.js should write to
 * integrate with the target platform. The build pipeline applies this adapter
 * after producing platform-neutral build artifacts.
 */
export function createDeploymentAdapter(
	target: DeploymentTarget,
	options: DeploymentAdapterOptions,
): DeploymentAdapter {
	const resolved = base(options);

	switch (target) {
		case "vercel":
			return buildVercelAdapter(resolved);

		case "netlify":
			return buildNetlifyAdapter(resolved);

		case "cloudflare-workers":
		case "cloudflare-pages":
			return buildCloudflareAdapter(resolved, target);

		case "docker":
			return buildDockerAdapter(resolved);

		case "static":
		case "github-pages":
			return target === "github-pages"
				? buildGitHubPagesAdapter(resolved)
				: buildStaticAdapter(resolved);

		case "aws-lambda":
			return buildAwsLambdaAdapter(resolved);

		case "bun":
		case "node":
		case "railway":
		case "render":
		case "fly":
		case "firebase":
		case "deno":
			return buildGenericServerAdapter(
				resolved,
				target,
				target === "node" ? "node" : "bun",
			);
	}
}

export function listDeploymentTargets(): DeploymentTarget[] {
	return Object.keys(TARGET_LABELS) as DeploymentTarget[];
}
