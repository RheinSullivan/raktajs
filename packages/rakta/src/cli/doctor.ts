// CLI: bun rakta doctor
import { existsSync } from "node:fs";
import { join } from "node:path";
import { loadConfig } from "../config/load-config";

interface CheckResult {
  readonly label: string;
  readonly passed: boolean;
  readonly note?: string;
}

export async function doctorCommand(cwd: string = process.cwd()): Promise<void> {
  const config = await loadConfig(cwd);

  const checks: CheckResult[] = [
    {
      label: "Bun runtime",
      passed: typeof Bun !== "undefined",
      note: typeof Bun !== "undefined" ? `v${Bun.version}` : "not found",
    },
    {
      label: "rakta.config.ts",
      passed:
        existsSync(join(cwd, "rakta.config.ts")) ||
        existsSync(join(cwd, "rakta.config.js")),
    },
    {
      label: `app/ directory (${config.appDir})`,
      passed: existsSync(join(cwd, config.appDir)),
    },
    {
      label: "app/page.tsx (root page)",
      passed: existsSync(join(cwd, config.appDir, "page.tsx")),
    },
    {
      label: "app/layout.tsx (root layout)",
      passed: existsSync(join(cwd, config.appDir, "layout.tsx")),
    },
    {
      label: `public/ directory (${config.publicDir})`,
      passed: existsSync(join(cwd, config.publicDir)),
    },
    {
      label: "package.json",
      passed: existsSync(join(cwd, "package.json")),
    },
    {
      label: "tsconfig.json",
      passed: existsSync(join(cwd, "tsconfig.json")),
    },
  ];

  const sep = "─".repeat(52);
  console.log(`\n  Rakta.js Doctor`);
  console.log(`  ${sep}`);

  let allPassed = true;
  for (const check of checks) {
    const icon = check.passed ? "pass" : "FAIL";
    const note = check.note ? `  (${check.note})` : "";
    console.log(`  [${icon}]  ${check.label}${note}`);
    if (!check.passed) allPassed = false;
  }

  console.log(`  ${sep}`);

  if (allPassed) {
    console.log("  All checks passed.\n");
  } else {
    console.log("  Some checks failed. Review the output above.\n");
    process.exit(1);
  }
}