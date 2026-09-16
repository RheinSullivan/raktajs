import { existsSync, readdirSync, readFileSync } from "node:fs";
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
		.replace(/[-_.\s]+/g, " ")
		.trim()
		.split(" ")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join("");
}

function deriveExportName(
	filePath: string,
	dirPath: string,
): { name: string; simpleName: string } {
	const relativePath = relative(dirPath, filePath).replace(/\\/g, "/");

	const withoutExtension = relativePath
		.replace(/\.(ts|tsx|js|jsx)$/, "")
		.replace(/\/index$/, "");

	const pascalName = toPascalCase(withoutExtension.replace(/\//g, "_"));
	const rawBaseName = basename(withoutExtension);
	const simpleName = toPascalCase(rawBaseName);

	return {
		name: pascalName,
		simpleName,
	};
}

function discoverExportNames(
	filePath: string,
	simpleName: string,
): { exportedNames: string[]; hasDefaultExport: boolean } {
	const source = readFileSync(filePath, "utf-8");
	const exportedNames = new Set<string>();
	const valueExportPattern =
		/\bexport\s+(?:declare\s+)?(?:const|let|var|function|class|enum)\s+([A-Za-z_$][\w$]*)/g;
	const namedExportPattern = /\bexport\s*{([^}]+)}/g;

	for (const match of source.matchAll(valueExportPattern)) {
		const exportName = match[1];
		if (exportName) exportedNames.add(exportName);
	}

	for (const match of source.matchAll(namedExportPattern)) {
		const exportList = match[1];
		if (!exportList) continue;

		for (const entry of exportList.split(",")) {
			const value = entry.trim();
			if (!value) continue;
			if (value.startsWith("type ")) continue;

			const [originalName, alias] = value.split(/\s+as\s+/);
			if (!originalName) continue;
			if (originalName === "default") {
				if (alias) exportedNames.add(alias.trim());
				continue;
			}
			const exportedName = (alias ?? originalName).trim();
			if (exportedName) exportedNames.add(exportedName);
		}
	}

	const hasDefaultExport = /\bexport\s+default\b/.test(source);
	if (hasDefaultExport) exportedNames.add(simpleName);

	return { exportedNames: [...exportedNames], hasDefaultExport };
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
			const fileBase = basename(filePath).toLowerCase();
			if (
				fileBase.startsWith("page.") ||
				fileBase.startsWith("layout.") ||
				fileBase.startsWith("loading.") ||
				fileBase.startsWith("error.") ||
				fileBase.startsWith("notfound.") ||
				fileBase.startsWith("not-found.") ||
				fileBase.startsWith("route.")
			) {
				continue;
			}

			const relativeFromOutput = relative(outputAbs, filePath)
				.replace(/\\/g, "/")
				.replace(/\.(ts|tsx)$/, "");

			const importPath = relativeFromOutput.startsWith(".")
				? relativeFromOutput
				: `./${relativeFromOutput}`;

			const { name, simpleName } = deriveExportName(filePath, directoryAbs);
			const exportDetails = discoverExportNames(filePath, simpleName);

			discovered.push({
				name,
				simpleName,
				...exportDetails,
				filePath: relative(options.frontendRoot, filePath).replace(/\\/g, "/"),
				importPath,
				kind: detectKind(filePath),
			});
		}
	}

	return discovered;
}
