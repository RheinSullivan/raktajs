// CLI: bun rakta imports:generate

import {
	generateAutoImports,
	printAutoImportSummary,
} from "../autoImport/generator";
import { loadConfig } from "../config/loadConfig";

export async function importsGenerateCommand(
	currentWorkingDirectory: string = process.cwd(),
): Promise<void> {
	const config = await loadConfig(currentWorkingDirectory);

	if (!config.autoImport.enabled) {
		console.warn(
			"  Auto Import is disabled in rakta.config.ts (autoImport.enabled = false).",
		);
		return;
	}

	const manifest = generateAutoImports({
		frontendRoot: currentWorkingDirectory,
		directories: config.autoImport.directories,
		outputDirectory: config.autoImport.outputDirectory,
		extensions: config.autoImport.extensions ?? [".ts", ".tsx", ".js", ".jsx"],
		generateDts: config.autoImport.dts ?? true,
	});

	printAutoImportSummary(manifest);
}
