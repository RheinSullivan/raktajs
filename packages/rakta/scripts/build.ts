import { rmSync } from "node:fs";

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
	"auto-import",
	"pwa",
	"kernel",
	"middleware",
	"docs",
	"hooks",
	"deployment",
	"layout",
	"data",
	"dx",
	"plugin",
	"testing",
	"performance",
	"security",
	"ops",
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

async function main(): Promise<void> {
	rmSync(OUT_DIR, {
		recursive: true,
		force: true,
	});

	await bundleEntrypoint("./src/index.ts", OUT_DIR);
	await bundleEntrypoint("./src/cli/rakta.ts", `${OUT_DIR}/cli`);

	for (const moduleName of SUBPATH_MODULES) {
		await bundleEntrypoint(
			`./src/${moduleName}/index.ts`,
			`${OUT_DIR}/${moduleName}`,
		);
	}

	console.log(
		`Bundled root, cli, and ${SUBPATH_MODULES.length} subpath modules.`,
	);
}

main().catch((buildError: unknown) => {
	console.error(buildError);
	process.exit(1);
});
