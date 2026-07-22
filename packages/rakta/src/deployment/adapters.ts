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

function baseOptions(
	options: DeploymentAdapterOptions,
): Required<DeploymentAdapterOptions> {
	return {
		appName: options.appName,
		outDir: options.outDir ?? "dist",
		serverEntry: options.serverEntry ?? "dist/server.js",
		staticDir: options.staticDir ?? "dist",
		port: options.port ?? 3000,
	};
}

export function createDeploymentAdapter(
	target: DeploymentTarget,
	options: DeploymentAdapterOptions,
): DeploymentAdapter {
	const resolved = baseOptions(options);

	switch (target) {
		case "vercel":
			return {
				target,
				label: TARGET_LABELS[target],
				runtime: "edge",
				buildCommand: "bun run build",
				outputDirectory: resolved.outDir,
				environment: { NODE_ENV: "production" },
				files: [
					{
						path: "vercel.json",
						content: JSON.stringify(
							{
								version: 2,
								buildCommand: "bun run build",
								outputDirectory: resolved.outDir,
								framework: null,
								rewrites: [{ source: "/(.*)", destination: "/" }],
							},
							null,
							2,
						),
					},
				],
			};

		case "netlify":
			return {
				target,
				label: TARGET_LABELS[target],
				runtime: "edge",
				buildCommand: "bun run build",
				outputDirectory: resolved.outDir,
				environment: { NODE_ENV: "production" },
				files: [
					{
						path: "netlify.toml",
						content: `[build]
							command = "bun run build"
							publish = "${resolved.outDir}"

							[[redirects]]
							from = "/*"
							to = "/index.html"
							status = 200
						`,
					},
				],
			};

		case "cloudflare-workers":
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
						content: `name = "${resolved.appName}"
main = "${resolved.serverEntry}"
compatibility_date = "2026-07-22"

[assets]
directory = "${resolved.staticDir}"
`,
					},
				],
			};

		case "cloudflare-pages":
			return {
				target,
				label: TARGET_LABELS[target],
				runtime: "static",
				buildCommand: "bun run build",
				outputDirectory: resolved.outDir,
				environment: { NODE_ENV: "production" },
				files: [
					{
						path: "_headers",
						content: `/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
`,
					},
				],
			};

		case "docker":
			return {
				target,
				label: TARGET_LABELS[target],
				runtime: "bun",
				buildCommand: "docker build -t rakta-app .",
				startCommand: `docker run -p ${resolved.port}:${resolved.port} rakta-app`,
				outputDirectory: resolved.outDir,
				environment: { NODE_ENV: "production", PORT: String(resolved.port) },
				files: [
					{
						path: "Dockerfile",
						content: `FROM oven/bun:1.3
WORKDIR /app
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile --production
COPY . .
RUN bun run build
ENV NODE_ENV=production
ENV PORT=${resolved.port}
EXPOSE ${resolved.port}
CMD ["bun", "run", "start"]
`,
					},
					{
						path: ".dockerignore",
						content: `node_modules
dist
.git
.env
`,
					},
				],
			};

		case "github-pages":
		case "static":
			return {
				target,
				label: TARGET_LABELS[target],
				runtime: "static",
				buildCommand: "bun run build",
				outputDirectory: resolved.outDir,
				environment: { NODE_ENV: "production" },
				files: [
					{
						path: ".nojekyll",
						content: "",
					},
				],
			};

		default:
			return {
				target,
				label: TARGET_LABELS[target],
				runtime: target === "deno" ? "deno" : target === "bun" ? "bun" : "node",
				buildCommand: "bun run build",
				startCommand: "bun run start",
				outputDirectory: resolved.outDir,
				environment: { NODE_ENV: "production", PORT: String(resolved.port) },
				files: [
					{
						path: "rakta.deploy.json",
						content: JSON.stringify(
							{
								app: resolved.appName,
								target,
								runtime:
									target === "deno"
										? "deno"
										: target === "bun"
											? "bun"
											: "node",
								buildCommand: "bun run build",
								startCommand: "bun run start",
								outputDirectory: resolved.outDir,
							},
							null,
							2,
						),
					},
				],
			};
	}
}

export function listDeploymentTargets(): readonly DeploymentTarget[] {
	return Object.keys(TARGET_LABELS) as DeploymentTarget[];
}
