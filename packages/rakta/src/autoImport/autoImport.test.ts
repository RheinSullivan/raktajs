import { describe, expect, test } from "bun:test";
import {
	mkdirSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { generateAutoImports } from "./generator";

describe("auto-import generation", () => {
	test("discovers named exports and declares their globals", () => {
		const projectRoot = mkdtempSync(join(tmpdir(), "rakta-auto-import-"));

		try {
			mkdirSync(join(projectRoot, "app"));
			writeFileSync(
				join(projectRoot, "app", "metadata.ts"),
				"export const zixseSite = { name: 'Zixse' };\nexport type Site = typeof zixseSite;\n",
			);

			const manifest = generateAutoImports({
				frontendRoot: projectRoot,
				directories: ["app"],
				outputDirectory: ".rakta",
				generateDts: true,
			});
			const declarations = readFileSync(
				join(projectRoot, ".rakta", "autoImports.d.ts"),
				"utf-8",
			);

			expect(manifest.exports[0]?.exportedNames).toEqual(["zixseSite"]);
			expect(declarations).toContain(
				'const zixseSite: typeof import("../app/metadata")["zixseSite"];',
			);
			expect(declarations).not.toContain("const Site:");
		} finally {
			rmSync(projectRoot, { recursive: true, force: true });
		}
	});
});
