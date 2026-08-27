/**
 * buildValidator — validates the build output contract after every `rakta build`.
 *
 * Fails loudly with actionable diagnostics when the output is incomplete or
 * inconsistent. Never silently produces an invalid deployment artifact.
 */

import { existsSync, statSync } from "node:fs";
import type { RenderMode } from "../render/types";
import type { BuildManifest } from "./buildManifest";

export interface ValidationIssue {
	readonly kind: "error" | "warning";
	readonly message: string;
	readonly hint?: string | undefined;
}

export interface ValidationResult {
	readonly valid: boolean;
	readonly issues: ValidationIssue[];
}

function error(message: string, hint?: string): ValidationIssue {
	return hint !== undefined
		? { kind: "error", message, hint }
		: { kind: "error", message };
}

function warning(message: string, hint?: string): ValidationIssue {
	return hint !== undefined
		? { kind: "warning", message, hint }
		: { kind: "warning", message };
}

function fileExists(filePath: string): boolean {
	try {
		return existsSync(filePath) && statSync(filePath).isFile();
	} catch {
		return false;
	}
}

function _dirExists(dirPath: string): boolean {
	try {
		return existsSync(dirPath) && statSync(dirPath).isDirectory();
	} catch {
		return false;
	}
}

/** Validates a CSR / SPA build output. */
function validateCsr(manifest: BuildManifest): ValidationIssue[] {
	const issues: ValidationIssue[] = [];

	if (!fileExists(manifest.client.entry)) {
		issues.push(
			error(
				`Missing client entry: ${manifest.client.entry}`,
				"The JS bundler did not emit the client entry point. Check that the entry file exists and all imports resolve.",
			),
		);
	}

	for (const cssPath of manifest.client.css) {
		if (!fileExists(cssPath)) {
			issues.push(
				warning(
					`Missing CSS asset: ${cssPath}`,
					"The CSS file referenced in the build manifest was not found.",
				),
			);
		}
	}

	if (manifest.server !== undefined) {
		issues.push(
			warning(
				"Server bundle present in CSR build.",
				"A CSR build should not include a server bundle. Check your rendering configuration.",
			),
		);
	}

	return issues;
}

/** Validates an SSG build output. */
function validateSsg(manifest: BuildManifest): ValidationIssue[] {
	const issues: ValidationIssue[] = [];

	if (!fileExists(manifest.client.entry)) {
		issues.push(
			error(
				`Missing client entry: ${manifest.client.entry}`,
				"The client bundle was not produced. SSG still requires client-side hydration assets.",
			),
		);
	}

	for (const route of manifest.routes) {
		if (route.mode === "ssg" || route.mode === "csg") {
			if (route.htmlPath === undefined) {
				issues.push(
					error(
						`SSG route "${route.pattern}" has no htmlPath in the manifest.`,
						"The SSG pipeline did not record the output HTML path for this route.",
					),
				);
			} else if (!fileExists(route.htmlPath)) {
				issues.push(
					error(
						`SSG route "${route.pattern}": HTML file not found at ${route.htmlPath}`,
						"The HTML file was listed in the manifest but does not exist on disk. " +
							"This usually means the SSG renderer crashed for this route.",
					),
				);
			}
		}
	}

	if (manifest.server !== undefined) {
		issues.push(
			warning(
				"Server bundle present in SSG build.",
				"SSG output does not require a server bundle for static hosting.",
			),
		);
	}

	return issues;
}

/** Validates an SSR / streaming_ssr / edge / isr build output. */
function validateSsr(manifest: BuildManifest): ValidationIssue[] {
	const issues: ValidationIssue[] = [];

	if (!fileExists(manifest.client.entry)) {
		issues.push(
			error(
				`Missing client entry: ${manifest.client.entry}`,
				"The client bundle was not produced. SSR requires hydration assets.",
			),
		);
	}

	if (manifest.server === undefined) {
		issues.push(
			error(
				`SSR build is missing a server bundle.`,
				`Rendering mode is "${manifest.rendering}" which requires a server artifact. ` +
					"Check the SSR compiler configuration and ensure the server entry was generated.",
			),
		);
	} else if (!fileExists(manifest.server.entry)) {
		issues.push(
			error(
				`Missing server entry: ${manifest.server.entry}`,
				"The server bundle is referenced in the manifest but the file does not exist. " +
					"This usually means the server bundler step failed silently.",
			),
		);
	}

	return issues;
}

/**
 * Validates a production build manifest.
 * Returns a ValidationResult with all detected issues.
 * An empty issues array means the build is clean.
 */
export function validateBuildManifest(
	manifest: BuildManifest,
): ValidationResult {
	const issues: ValidationIssue[] = [];

	// Common: rendering mode must be a known value.
	const knownModes: RenderMode[] = [
		"csr",
		"spa",
		"ssg",
		"csg",
		"ssr",
		"hybrid",
		"isr",
		"streaming_ssr",
		"edge",
	];
	if (!knownModes.includes(manifest.rendering)) {
		issues.push(
			error(
				`Unknown rendering mode: "${manifest.rendering}"`,
				`Valid modes are: ${knownModes.join(", ")}`,
			),
		);
	}

	// Mode-specific validation.
	switch (manifest.rendering) {
		case "csr":
		case "spa":
		case "hybrid":
			issues.push(...validateCsr(manifest));
			break;

		case "ssg":
		case "csg":
			issues.push(...validateSsg(manifest));
			break;

		case "ssr":
		case "streaming_ssr":
		case "edge":
		case "isr":
			issues.push(...validateSsr(manifest));
			break;
	}

	const errors = issues.filter((i) => i.kind === "error");
	return {
		valid: errors.length === 0,
		issues,
	};
}

/**
 * Formats a ValidationResult into a human-readable diagnostic string.
 * Intended to be printed to stderr on build failure.
 */
export function formatValidationDiagnostics(
	result: ValidationResult,
	rendering: RenderMode,
): string {
	const lines: string[] = [
		``,
		`  Rakta.js build validation failed.`,
		``,
		`  Rendering mode: ${rendering.toUpperCase()}`,
		``,
	];

	const errors = result.issues.filter((i) => i.kind === "error");
	const warnings = result.issues.filter((i) => i.kind === "warning");

	if (errors.length > 0) {
		lines.push(`  Errors (${errors.length}):`);
		for (const issue of errors) {
			lines.push(`    ✗ ${issue.message}`);
			if (issue.hint) {
				lines.push(`      → ${issue.hint}`);
			}
		}
		lines.push(``);
	}

	if (warnings.length > 0) {
		lines.push(`  Warnings (${warnings.length}):`);
		for (const issue of warnings) {
			lines.push(`    ⚠ ${issue.message}`);
			if (issue.hint) {
				lines.push(`      → ${issue.hint}`);
			}
		}
		lines.push(``);
	}

	lines.push(`  Check:`);
	lines.push(`    - Rendering configuration in rakta.config.ts`);
	lines.push(`    - Entry file paths`);
	lines.push(`    - That all imports in your app/ directory resolve correctly`);
	lines.push(`    - Run "bun install" to ensure dependencies are installed`);
	lines.push(``);

	return lines.join("\n");
}

/**
 * Validates and prints diagnostics.
 * Returns true if valid, false if there were errors (warnings do not fail).
 */
export function validateAndReport(manifest: BuildManifest): boolean {
	const result = validateBuildManifest(manifest);

	if (!result.valid) {
		process.stderr.write(
			formatValidationDiagnostics(result, manifest.rendering),
		);
		return false;
	}

	const warnings = result.issues.filter((i) => i.kind === "warning");
	if (warnings.length > 0) {
		for (const w of warnings) {
			process.stderr.write(`  ⚠ ${w.message}\n`);
		}
	}

	return true;
}
