import { mkdirSync } from "node:fs";
import { join } from "node:path";

const repositoryRoot = join(import.meta.dir, "..", "..", "..");
const goCache = join(repositoryRoot, ".tmp", "go-build");
const modules = [
	{ label: "engine", root: join(repositoryRoot, "engine") },
	{ label: "tools/go", root: join(repositoryRoot, "tools", "go") },
];

mkdirSync(goCache, { recursive: true });

for (const module of modules) {
	console.log(`\n[Rakta Go] Testing ${module.label}`);
	const processHandle = Bun.spawn(["go", "test", "./..."], {
		cwd: module.root,
		env: {
			...process.env,
			GOCACHE: goCache,
			GOTELEMETRY: "off",
		},
		stderr: "inherit",
		stdout: "inherit",
	});

	const exitCode = await processHandle.exited;
	if (exitCode !== 0) {
		process.exit(exitCode);
	}
}
