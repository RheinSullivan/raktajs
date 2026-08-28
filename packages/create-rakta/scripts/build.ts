import { cpSync, existsSync, rmSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const currentDirectory = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(currentDirectory, "..");
const workspaceRoot = resolve(packageRoot, "../..");
const outDirectory = resolve(packageRoot, "dist");
const backendTemplateSources = [
	resolve(workspaceRoot, "templates/fullStack/backend"),
];
const backendTemplateTarget = resolve(
	outDirectory,
	"templates/fullStack/backend",
);
const backendTemplateSource = backendTemplateSources.find((candidatePath) =>
	existsSync(candidatePath),
);
const frontendOnlyTemplateSources = [
	resolve(workspaceRoot, "templates/frontendOnly"),
	resolve(workspaceRoot, "templates/frontendonly"),
];
const frontendOnlyTemplateTarget = resolve(
	outDirectory,
	"templates/frontendOnly",
);
const frontendOnlyTemplateSource = frontendOnlyTemplateSources.find(
	(candidatePath) => existsSync(candidatePath),
);
const fullstackFrontendTemplateSources = [
	resolve(workspaceRoot, "templates/fullStack/frontend"),
];
const fullstackFrontendTemplateTarget = resolve(
	outDirectory,
	"templates/fullStack/frontend",
);
const fullstackFrontendTemplateSource = fullstackFrontendTemplateSources.find(
	(candidatePath) => existsSync(candidatePath),
);

rmSync(outDirectory, { recursive: true, force: true });

const buildResult = await Bun.build({
	entrypoints: [resolve(packageRoot, "src/index.ts")],
	outdir: outDirectory,
	target: "node",
	sourcemap: "external",
});

if (!buildResult.success) {
	for (const buildLog of buildResult.logs) {
		console.error(buildLog.message);
	}

	throw new Error("Failed to build create-rakta-app.");
}

if (backendTemplateSource === undefined) {
	throw new Error(
		`Failed to find the Gaman.js backend template. Checked: ${backendTemplateSources.join(", ")}`,
	);
}

cpSync(backendTemplateSource, backendTemplateTarget, {
	recursive: true,
});

if (frontendOnlyTemplateSource === undefined) {
	throw new Error(
		`Failed to find the frontend-only template. Checked: ${frontendOnlyTemplateSources.join(", ")}`,
	);
}

cpSync(frontendOnlyTemplateSource, frontendOnlyTemplateTarget, {
	recursive: true,
});

if (fullstackFrontendTemplateSource === undefined) {
	throw new Error(
		`Failed to find the fullstack frontend template. Checked: ${fullstackFrontendTemplateSources.join(", ")}`,
	);
}

cpSync(fullstackFrontendTemplateSource, fullstackFrontendTemplateTarget, {
	recursive: true,
});

const fullstackScriptsSource = resolve(
	workspaceRoot,
	"templates/fullStack/scripts",
);
const fullstackScriptsTarget = resolve(
	outDirectory,
	"templates/fullStack/scripts",
);
if (existsSync(fullstackScriptsSource)) {
	cpSync(fullstackScriptsSource, fullstackScriptsTarget, {
		recursive: true,
	});
}

console.log("Bundled create-rakta-app templates.");
