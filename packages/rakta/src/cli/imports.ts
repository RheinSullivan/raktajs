// CLI: bun rakta imports:generate

import {
	generateAutoImports,
	printAutoImportSummary,
} from "../auto-import/generator";
import { loadConfig } from "../config/loadConfig";

export async function importsGenerateCommand(
	cwd: string = process.cwd(),
): Promise<void> {
	const config = await loadConfig(cwd);

	if (!config.autoImport.enabled) {
		console.warn(
			"  Auto Import is disabled in rakta.config.ts (autoImport.enabled = false).",
		);
		return;
	}

	const manifest = generateAutoImports({
		frontendRoot: cwd,
		directories: config.autoImport.directories,
		outputDirectory: config.autoImport.outputDirectory,
		extensions: config.autoImport.extensions ?? [".ts", ".tsx", ".js", ".jsx"],
		generateDts: config.autoImport.dts ?? true,
	});

	printAutoImportSummary(manifest);
}
