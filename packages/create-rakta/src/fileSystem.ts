import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import type { ProjectFile } from "./types";

export function ensureDirectory(dirPath: string): void {
	if (!existsSync(dirPath)) {
		mkdirSync(dirPath, {
			recursive: true,
		});
	}
}

export function writeFile(absolutePath: string, fileContent: string): void {
	ensureDirectory(dirname(absolutePath));
	writeFileSync(absolutePath, fileContent, "utf-8");
}

export function writeProjectFiles(
	projectRoot: string,
	generatedFiles: ProjectFile[],
): void {
	for (const projectFile of generatedFiles) {
		const absolutePath = join(resolve(projectRoot), projectFile.path);
		writeFile(absolutePath, projectFile.content);
	}
}

export function projectDirectoryExists(projectName: string): boolean {
	return existsSync(resolve(process.cwd(), projectName));
}
