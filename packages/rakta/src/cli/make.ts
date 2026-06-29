import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { loadConfig } from "../config/loadConfig";

type MakeTarget = "page" | "layout" | "component" | "api";

function toPascalCase(name: string): string {
	return name
		.split(/[-_/]/)
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join("");
}

function writeIfNew(filePath: string, content: string): void {
	if (existsSync(filePath)) {
		console.warn(`  Already exists: ${filePath}`);
		return;
	}
	mkdirSync(dirname(filePath), { recursive: true });
	writeFileSync(filePath, content, "utf-8");
	console.log(`  Created: ${filePath}`);
}

export async function makeCommand(
	target: MakeTarget,
	name: string,
	cwd: string = process.cwd(),
): Promise<void> {
	const config = await loadConfig(cwd);
	const appDir = join(cwd, config.appDir);
	const componentName = toPascalCase(name);

	switch (target) {
		case "page": {
			const filePath = join(appDir, name, "page.tsx");
			writeIfNew(
				filePath,
				`// ${filePath.replace(cwd + "/", "")}
import React from "react";
import type { Metadata } from "rakta/seo";

export const metadata: Metadata = {
  title: "${componentName}",
};

export default function ${componentName}Page() {
  return (
    <main>
      <h1>${componentName}</h1>
    </main>
  );
}
`,
			);
			break;
		}

		case "layout": {
			const filePath = join(appDir, name, "layout.tsx");
			writeIfNew(
				filePath,
				`// ${filePath.replace(cwd + "/", "")}
import React from "react";
import type { LayoutProps } from "rakta/router";

export default function ${componentName}Layout({ children }: LayoutProps) {
  return <section>{children}</section>;
}
`,
			);
			break;
		}

		case "component": {
			const filePath = join(cwd, "components", "ui", `${componentName}.tsx`);
			writeIfNew(
				filePath,
				`// components/ui/${componentName}.tsx
import React from "react";

export interface ${componentName}Props {
  children?: React.ReactNode;
  className?: string;
}

export function ${componentName}({ children, className }: ${componentName}Props) {
  return <div className={className}>{children}</div>;
}

export default ${componentName};
`,
			);
			break;
		}

		case "api": {
			const filePath = join(appDir, "api", name, "route.ts");
			writeIfNew(
				filePath,
				`// ${filePath.replace(cwd + "/", "")}
import type { RouteContext } from "rakta/router";

export async function GET(_request: Request, context: RouteContext): Promise<Response> {
  return Response.json({ message: "Hello from /api/${name}", pathname: context.pathname });
}
`,
			);
			break;
		}
	}
}
