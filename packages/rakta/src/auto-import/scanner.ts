import { existsSync, readdirSync } from "node:fs";
import { basename, extname, join, relative } from "node:path";
import type { AutoImportKind, DiscoveredExport } from "./types";

const DEFAULT_EXTENSIONS: ReadonlyArray<string> = [
	".ts",
	".tsx",
	".js",
	".jsx",
];

function detectKind(filePath: string): AutoImportKind {
	const lower = filePath.replace(/\\/g, "/").toLowerCase();

	if (
		lower.includes("/stores/") ||
		lower.endsWith(".store.ts") ||
		lower.endsWith(".store.tsx")
	) {
		return "store";
	}

	if (
		lower.includes("/schemas/") ||
		lower.endsWith(".schema.ts") ||
		lower.endsWith(".schema.tsx")
	) {
		return "schema";
	}

	if (lower.includes("/components/")) {
		return "component";
	}

	const fileName = basename(lower);

	if (fileName.startsWith("use")) {
		return "hook";
	}

	if (
		lower.includes("/lib/") ||
		lower.includes("/utils/") ||
		lower.includes("/helpers/")
	) {
		return "utils";
	}

	return "unknown";
}

function toPascalCase(text: string): string {
	return text
		.replace(/[-_.]/g, " ")
		.replace(/\s+(.)/g, (_match: string, char: string) => char.toUpperCase())
		.replace(/^(.)/, (_match: string, char: string) => char.toUpperCase());
}

function deriveExportName(filePath: string, dirPath: string): string {
	const relativePath = relative(dirPath, filePath).replace(/\\/g, "/");

	const withoutExtension = relativePath
		.replace(/\.(ts|tsx|js|jsx)$/, "")
		.replace(/\/index$/, "");

	return toPascalCase(withoutExtension.replace(/\//g, "_"));
}

function walkDirectory(
	dirPath: string,
	extensions: ReadonlyArray<string>,
): string[] {
	if (!existsSync(dirPath)) {
		return [];
	}

	const collected: string[] = [];

	function walk(currentPath: string): void {
		const entries = readdirSync(currentPath, {
			withFileTypes: true,
		});

		for (const entry of entries) {
			if (entry.name.startsWith(".") || entry.name === "node_modules") {
				continue;
			}

			const fullPath = join(currentPath, entry.name);

			if (entry.isDirectory()) {
				walk(fullPath);
				continue;
			}

			if (entry.isFile() && extensions.includes(extname(entry.name))) {
				collected.push(fullPath);
			}
		}
	}

	walk(dirPath);

	return collected;
}

export interface ScanForExportsOptions {
	readonly frontendRoot: string;
	readonly directories: ReadonlyArray<string>;
	readonly outputDirectory: string;
	readonly extensions?: ReadonlyArray<string>;
}

export function scanForExports(
	options: ScanForExportsOptions,
): DiscoveredExport[] {
	const extensions = options.extensions ?? DEFAULT_EXTENSIONS;
	const discovered: DiscoveredExport[] = [];
	const outputAbs = join(options.frontendRoot, options.outputDirectory);

	for (const directory of options.directories) {
		const directoryAbs = join(options.frontendRoot, directory);

		const files = walkDirectory(directoryAbs, extensions);

		for (const filePath of files) {
			const relativeFromOutput = relative(outputAbs, filePath)
				.replace(/\\/g, "/")
				.replace(/\.(ts|tsx)$/, "");

			const importPath = relativeFromOutput.startsWith(".")
				? relativeFromOutput
				: `./${relativeFromOutput}`;

			discovered.push({
				name: deriveExportName(filePath, directoryAbs),
				filePath: relative(options.frontendRoot, filePath).replace(/\\/g, "/"),
				importPath,
				kind: detectKind(filePath),
			});
		}
	}

	return discovered;
}
