import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import type { RouteManifest, RouteManifestEntry } from "../router/types";

export interface ClientEntryOptions {
	readonly projectRoot: string;
	readonly appDir: string;
	readonly workDir: string;
	readonly manifest: RouteManifest;
}

function toModuleSpecifier(fromFile: string, targetFile: string): string {
	const relativePath = relative(dirname(fromFile), targetFile).replace(
		/\\/g,
		"/",
	);

	if (relativePath.startsWith(".")) {
		return relativePath;
	}

	return `./${relativePath}`;
}

function toCssImportSpecifier(
	entryPath: string,
	projectRoot: string,
): string | null {
	const candidates = [
		join(projectRoot, "styles", "globals.css"),
		join(projectRoot, "styles", "globals.scss"),
		join(projectRoot, "styles", "globals.sass"),
	];

	const stylePath = candidates.find((candidate) => existsSync(candidate));

	if (!stylePath) {
		return null;
	}

	return toModuleSpecifier(entryPath, stylePath);
}

function getPageRoutes(manifest: RouteManifest): RouteManifestEntry[] {
	return manifest.routes.filter((route) => route.kind === "page");
}

function buildRouteImports(
	entryPath: string,
	appDir: string,
	pageRoutes: ReadonlyArray<RouteManifestEntry>,
): string {
	const routeEntries = pageRoutes
		.map((route) => {
			const pagePath = join(appDir, route.filePath);
			return `  ${JSON.stringify(route.urlPattern)}: () => import("${toModuleSpecifier(entryPath, pagePath)}"),`;
		})
		.join("\n");

	return `const routeModules = {\n${routeEntries}\n} as const;`;
}

function buildRouteTable(
	pageRoutes: ReadonlyArray<RouteManifestEntry>,
): string {
	const routeEntries = pageRoutes
		.map(
			(route) =>
				`  ${JSON.stringify(route.urlPattern)}: routeModules[${JSON.stringify(route.urlPattern)}],`,
		)
		.join("\n");

	return `const routes = {\n${routeEntries}\n} as const;`;
}

function findExistingModule(
	basePathWithoutExtension: string,
): string | undefined {
	const candidates = [".tsx", ".ts", ".jsx", ".js"].map(
		(extension) => `${basePathWithoutExtension}${extension}`,
	);

	return candidates.find((candidate) => existsSync(candidate));
}

function buildStarterGlobalLoaders(entryPath: string, appDir: string): string {
	const mascotPath = findExistingModule(
		join(appDir, "components", "raktaShrimpMascot"),
	);
	const gamePath = findExistingModule(
		join(appDir, "components", "shrimpRunGame"),
	);
	const loaders: string[] = [];

	if (mascotPath !== undefined) {
		loaders.push(`  const mascotModule = await import("${toModuleSpecifier(entryPath, mascotPath)}");
  (globalThis as typeof globalThis & Record<string, unknown>).RaktaShrimpMascot = mascotModule.default;`);
	}

	if (gamePath !== undefined) {
		loaders.push(`  const gameModule = await import("${toModuleSpecifier(entryPath, gamePath)}");
  (globalThis as typeof globalThis & Record<string, unknown>).ShrimpRunGame = gameModule.default;`);
	}

	if (loaders.length === 0) {
		return `async function loadRaktaGlobals(): Promise<void> {
  return;
}`;
	}

	return `async function loadRaktaGlobals(): Promise<void> {
${loaders.join("\n\n")}
}`;
}

function buildClientEntrySource(
	options: ClientEntryOptions,
	entryPath: string,
): string {
	const pageRoutes = getPageRoutes(options.manifest);
	const routeModules = buildRouteImports(entryPath, options.appDir, pageRoutes);
	const routeTable = buildRouteTable(pageRoutes);
	const cssImportSpecifier = toCssImportSpecifier(
		entryPath,
		options.projectRoot,
	);
	const cssImport =
		cssImportSpecifier !== null ? `import "${cssImportSpecifier}";\n` : "";
	const starterGlobalLoaders = buildStarterGlobalLoaders(
		entryPath,
		options.appDir,
	);

	return `import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import * as ReactHooks from "react";
${cssImport}
(globalThis as typeof globalThis & Record<string, unknown>).useCallback = ReactHooks.useCallback;
(globalThis as typeof globalThis & Record<string, unknown>).useEffect = ReactHooks.useEffect;
(globalThis as typeof globalThis & Record<string, unknown>).useRef = ReactHooks.useRef;
(globalThis as typeof globalThis & Record<string, unknown>).useState = ReactHooks.useState;

${starterGlobalLoaders}

await loadRaktaGlobals();

${routeModules}

${routeTable}

type RoutePath = keyof typeof routes;
type PageModule = { default: React.ComponentType };

function normalizePathname(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }

  return pathname;
}

function resolveRouteLoader(pathname: string): () => Promise<PageModule> {
  const normalizedPathname = normalizePathname(pathname) as RoutePath;

  return routes[normalizedPathname] ?? routes["/"];
}

function navigate(to: string): void {
  window.history.pushState({ source: "rakta-click", to }, "", to);
  window.dispatchEvent(new PopStateEvent("popstate", { state: { to } }));
}

function App(): React.ReactElement {
  const [pathname, setPathname] = useState(() => window.location.pathname);
  const [Page, setPage] = useState<React.ComponentType | null>(null);

  useEffect(() => {
    function handlePopState(): void {
      setPathname(window.location.pathname);
    }

    function handleClick(event: MouseEvent): void {
      const target = event.target;

      if (!(target instanceof Element)) {
        return;
      }

      const clickElement = target.closest("click");

      if (!clickElement) {
        return;
      }

      const to = clickElement.getAttribute("to");

      if (!to || to.startsWith("http://") || to.startsWith("https://")) {
        return;
      }

      event.preventDefault();
      navigate(to);
      setPathname(window.location.pathname);
    }

    window.addEventListener("popstate", handlePopState);
    document.addEventListener("click", handleClick);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      document.removeEventListener("click", handleClick);
    };
  }, []);

  useEffect(() => {
    let isCurrent = true;

    resolveRouteLoader(pathname)().then((pageModule) => {
      if (isCurrent) {
        setPage(() => pageModule.default);
      }
    });

    return () => {
      isCurrent = false;
    };
  }, [pathname]);

  if (!Page) {
    return React.createElement("main", {
      style: {
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "#050505",
        color: "#f8fafc",
        fontFamily: "ui-sans-serif, system-ui, sans-serif",
      },
    }, "Loading Rakta.js...");
  }

  return React.createElement(Page);
}

const rootElement = document.getElementById("rakta-root");

if (!rootElement) {
  throw new Error("Rakta.js root element #rakta-root was not found.");
}

createRoot(rootElement).render(React.createElement(App));
`;
}

export function writeClientEntry(options: ClientEntryOptions): string {
	mkdirSync(options.workDir, { recursive: true });

	const entryPath = join(options.workDir, "client-entry.tsx");
	const entrySource = buildClientEntrySource(options, entryPath);

	writeFileSync(entryPath, entrySource, "utf-8");

	return entryPath;
}
