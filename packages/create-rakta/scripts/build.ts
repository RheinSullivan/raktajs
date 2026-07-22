import { cpSync, rmSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const currentDirectory = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(currentDirectory, "..");
const workspaceRoot = resolve(packageRoot, "../..");
const outDirectory = resolve(packageRoot, "dist");
const backendTemplateSource = resolve(
	workspaceRoot,
	"templates/fullStack/backend",
);
const backendTemplateTarget = resolve(
	outDirectory,
	"templates/fullStack/backend",
);

rmSync(outDirectory, { recursive: true, force: true });

const buildResult = await Bun.build({
	entrypoints: [resolve(packageRoot, "src/index.ts")],
	outdir: outDirectory,
	target: "bun",
	sourcemap: "external",
});

if (!buildResult.success) {
	for (const buildLog of buildResult.logs) {
		console.error(buildLog.message);
	}

	throw new Error("Failed to build create-rakta-app.");
}

cpSync(backendTemplateSource, backendTemplateTarget, {
	recursive: true,
});

console.log("Bundled create-rakta-app and the Gaman.js backend template.");
