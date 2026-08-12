import { readFileSync } from "node:fs";
import { join } from "node:path";

const targetUrl = process.argv[2] ?? "http://localhost:3000";
const packageJson = JSON.parse(
	readFileSync(join(import.meta.dir, "..", "package.json"), "utf8"),
) as { readonly version: string };
const raktaVersion = packageJson.version;

interface CheckResult {
	readonly label: string;
	readonly ok: boolean;
	readonly detail?: string;
}

function hasRootMarker(html: string): boolean {
	return (
		/<div[^>]+id=["']rakta-root["'][^>]+data-rakta(?:=["'][^"']*["'])?/i.test(
			html,
		) ||
		/<div[^>]+data-rakta(?:=["'][^"']*["'])?[^>]+id=["']rakta-root["']/i.test(
			html,
		)
	);
}

async function main(): Promise<void> {
	const response = await fetch(targetUrl, {
		headers: { Accept: "text/html" },
	});
	const html = await response.text();
	const headerVersion = response.headers.get("x-rakta-version");
	const checks: CheckResult[] = [
		{
			label: "generator metadata",
			ok: /<meta[^>]+name=["']generator["'][^>]+content=["']Rakta\.js["']/i.test(
				html,
			),
		},
		{
			label: "html data-framework marker",
			ok: /<html[^>]+data-framework=["']raktajs["']/i.test(html),
		},
		{ label: "root data-rakta marker", ok: hasRootMarker(html) },
		{
			label: "window.__RAKTA__ runtime marker",
			ok: html.includes("window.__RAKTA__"),
		},
		{
			label: "runtime version marker",
			ok: html.includes(`"version":"${raktaVersion}"`),
			detail: raktaVersion,
		},
		{
			label: "X-Rakta-Version header",
			ok: headerVersion === raktaVersion,
			detail: headerVersion ?? "missing",
		},
	];

	for (const check of checks) {
		const suffix = check.detail !== undefined ? ` (${check.detail})` : "";
		console.log(`${check.ok ? "PASS" : "FAIL"} ${check.label}${suffix}`);
	}

	if (checks.some((check) => !check.ok)) {
		process.exitCode = 1;
	}
}

main().catch((error: unknown) => {
	console.error(error instanceof Error ? error.message : String(error));
	process.exitCode = 1;
});
