import { rmSync } from "node:fs";

const OUT_DIR = "./dist";

async function runTypeScriptBuild(): Promise<void> {
	const buildProcess = Bun.spawn(
		[
			"node",
			"--max-old-space-size=4096",
			"../../node_modules/typescript/lib/tsc.js",
			"-p",
			"./tsconfig.build.json",
		],
		{
			stdout: "inherit",
			stderr: "inherit",
		},
	);

	const exitCode = await buildProcess.exited;

	if (exitCode !== 0) {
		throw new Error("TypeScript failed to emit the Rakta.js package.");
	}
}

async function main(): Promise<void> {
	rmSync(OUT_DIR, {
		recursive: true,
		force: true,
	});

	await runTypeScriptBuild();

	console.log("Emitted Rakta.js ESM modules and type declarations.");
}

main().catch((buildError: unknown) => {
	console.error(buildError);
	process.exit(1);
});
