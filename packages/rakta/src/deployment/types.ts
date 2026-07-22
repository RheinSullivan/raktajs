export type DeploymentTarget =
	| "node"
	| "bun"
	| "deno"
	| "cloudflare-workers"
	| "cloudflare-pages"
	| "netlify"
	| "vercel"
	| "docker"
	| "aws-lambda"
	| "fly"
	| "railway"
	| "render"
	| "firebase"
	| "github-pages"
	| "static";

export interface DeploymentAdapterOptions {
	readonly appName: string;
	readonly outDir?: string;
	readonly serverEntry?: string;
	readonly staticDir?: string;
	readonly port?: number;
}

export interface DeploymentFile {
	readonly path: string;
	readonly content: string;
}

export interface DeploymentAdapter {
	readonly target: DeploymentTarget;
	readonly label: string;
	readonly runtime: "node" | "bun" | "deno" | "edge" | "static";
	readonly files: readonly DeploymentFile[];
	readonly buildCommand: string;
	readonly startCommand?: string;
	readonly outputDirectory: string;
	readonly environment: Readonly<Record<string, string>>;
}
