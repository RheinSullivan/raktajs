import { rmSync, writeFileSync } from "node:fs";

const SUBPATH_MODULES: readonly string[] = [
	"components",
	"router",
	"seo",
	"config",
	"render",
	"forge",
	"tide",
	"rpc",
	"store",
	"schema",
	"http",
	"autoImport",
	"pwa",
	"kernel",
	"middleware",
	"docs",
	"hooks",
	"deployment",
	"layout",
	"data",
	"developerExperience",
	"plugin",
	"testing",
	"performance",
	"security",
	"ops",
	"ecosystem",
	"motion",
	"scene",
	"vector",
	"cli",
	"api",
	"auth",
];

const OUT_DIR = "./dist";

async function bundleEntrypoint(
	entrypointPath: string,
	outputDirectory: string,
): Promise<void> {
	const buildResult = await Bun.build({
		entrypoints: [entrypointPath],
		outdir: outputDirectory,
		target: "bun",
		sourcemap: "external",
	});

	if (!buildResult.success) {
		for (const buildLog of buildResult.logs) {
			console.error(buildLog.message);
		}

		throw new Error(`Failed to bundle ${entrypointPath}`);
	}
}

async function bundleEntrypoints(
	entrypointPaths: ReadonlyArray<string>,
	outputDirectory: string,
): Promise<void> {
	const buildResult = await Bun.build({
		entrypoints: [...entrypointPaths],
		outdir: outputDirectory,
		target: "browser",
		packages: "external",
		sourcemap: "external",
		naming: {
			entry: "[name].[ext]",
		},
	});

	if (!buildResult.success) {
		for (const buildLog of buildResult.logs) {
			console.error(buildLog.message);
		}

		throw new Error(`Failed to bundle ${entrypointPaths.join(", ")}`);
	}
}

async function bundleBrowserSubpaths(): Promise<void> {
	await bundleEntrypoints(
		[
			"./src/components/Alert.tsx",
			"./src/components/Click.tsx",
			"./src/components/Picture.tsx",
			"./src/components/Scroll.tsx",
			"./src/components/Toaster.tsx",
		],
		`${OUT_DIR}/components`,
	);
	writeFileSync(
		`${OUT_DIR}/components/index.js`,
		[
			'export { Alert, RaktaAlert } from "./Alert.js";',
			'export { Click } from "./Click.js";',
			'export { Picture } from "./Picture.js";',
			'export { Pantura, Reborns, usePantura } from "./Scroll.js";',
			'export { RaktaToast, Toaster, toast, useToast } from "./Toaster.js";',
			"",
		].join("\n"),
	);

	await bundleEntrypoints(
		[
			"./src/seo/head.tsx",
			"./src/seo/metadata.ts",
			"./src/seo/robots.ts",
			"./src/seo/sitemap.ts",
		],
		`${OUT_DIR}/seo`,
	);
	writeFileSync(
		`${OUT_DIR}/seo/index.js`,
		[
			'export { RaktaHead } from "./head.js";',
			'export { mergeMetadata, resolveRobotsContent, resolveTitle } from "./metadata.js";',
			'export { createRobotsHandler, generateRobotsTxt } from "./robots.js";',
			'export { createSitemapHandler, generateSitemapIndexXml, generateSitemapXml } from "./sitemap.js";',
			"",
		].join("\n"),
	);
}

async function main(): Promise<void> {
	rmSync(OUT_DIR, {
		recursive: true,
		force: true,
	});

	await bundleEntrypoint("./src/index.ts", OUT_DIR);
	await bundleEntrypoint("./src/cli/rakta.ts", `${OUT_DIR}/cli`);

	for (const moduleName of SUBPATH_MODULES) {
		if (moduleName === "components" || moduleName === "seo") {
			continue;
		}

		await bundleEntrypoint(
			`./src/${moduleName}/index.ts`,
			`${OUT_DIR}/${moduleName}`,
		);
	}

	await bundleBrowserSubpaths();

	console.log(
		`Bundled root, cli, and ${SUBPATH_MODULES.length} subpath modules.`,
	);
}

main().catch((buildError: unknown) => {
	console.error(buildError);
	process.exit(1);
});
