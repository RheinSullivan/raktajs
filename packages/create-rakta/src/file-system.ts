import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import type { ProjectFile } from "./types";

export function ensureDirectory(dirPath: string): void {
  if (!existsSync(dirPath)) {
    mkdirSync(dirPath, {
      recursive: true
    });
  }
}

export function writeFile(absolutePath: string, content: string): void {
  ensureDirectory(
    dirname(
        absolutePath
    )
);
  writeFileSync(
    absolutePath,
    content, "utf-8"
  );
}

export function writeProjectFiles(projectRoot: string, files: ProjectFile[]): void {
  for (const file of files) {
    const absolutePath = join(
        resolve(projectRoot),
        file.path
    );
    writeFile(
        absolutePath,
        file.content
    );
  }
}

export function projectDirectoryExists(name: string): boolean {
  return existsSync(
    resolve(
        process.cwd(),
        name
    )
  );
}