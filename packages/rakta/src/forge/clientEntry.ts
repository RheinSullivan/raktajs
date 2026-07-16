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
	const loaders: string[] = [];
	const componentGlobals = [
		"ComponentsModal",
		"CoralObstacle",
		"DeployModal",
		"DocsModal",
		"ShrimpCharacter",
		"raktaShrimpMascot",
		"shrimpRunGame",
	];

	for (const componentName of componentGlobals) {
		const componentPath = findExistingModule(
			join(appDir, "components", componentName),
		);

		if (componentPath !== undefined) {
			const globalName =
				componentName === "raktaShrimpMascot"
					? "RaktaShrimpMascot"
					: componentName === "shrimpRunGame"
						? "ShrimpRunGame"
						: componentName;

			loaders.push(`  const ${globalName}Module = await import("${toModuleSpecifier(entryPath, componentPath)}");
  (globalThis as typeof globalThis & Record<string, unknown>).${globalName} = ${globalName}Module.default;`);
		}
	}

	const audioPath = findExistingModule(join(appDir, "utils", "audio"));

	if (audioPath !== undefined) {
		loaders.push(`  const audioModule = await import("${toModuleSpecifier(entryPath, audioPath)}");
  (globalThis as typeof globalThis & Record<string, unknown>).getMuteState = audioModule.getMuteState;
  (globalThis as typeof globalThis & Record<string, unknown>).playGameOverSound = audioModule.playGameOverSound;
  (globalThis as typeof globalThis & Record<string, unknown>).playJumpSound = audioModule.playJumpSound;
  (globalThis as typeof globalThis & Record<string, unknown>).playScoreSound = audioModule.playScoreSound;
  (globalThis as typeof globalThis & Record<string, unknown>).setMute = audioModule.setMute;`);
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
import { motion } from "motion/react";
import {
	LuArrowRight as ArrowRight,
	LuBook as Book,
	LuCheck as Check,
	LuCircleCheck as CheckCircle2,
	LuCloud as Cloud,
	LuCode as Code,
	LuCopy as Copy,
	LuCpu as Cpu,
	LuGithub as Github,
	LuInfo as Info,
	LuPlay as Play,
	LuRotateCcw as RotateCcw,
	LuSearch as Search,
	LuServer as Server,
	LuTerminal as Terminal,
	LuVolume2 as Volume2,
  LuVolumeX as VolumeX,
  LuX as X,
} from "react-icons/lu";
${cssImport}
(globalThis as typeof globalThis & Record<string, unknown>).useCallback = ReactHooks.useCallback;
(globalThis as typeof globalThis & Record<string, unknown>).useEffect = ReactHooks.useEffect;
(globalThis as typeof globalThis & Record<string, unknown>).useRef = ReactHooks.useRef;
(globalThis as typeof globalThis & Record<string, unknown>).useState = ReactHooks.useState;
(globalThis as typeof globalThis & Record<string, unknown>).motion = motion;
(globalThis as typeof globalThis & Record<string, unknown>).ArrowRight = ArrowRight;
(globalThis as typeof globalThis & Record<string, unknown>).Book = Book;
(globalThis as typeof globalThis & Record<string, unknown>).Check = Check;
(globalThis as typeof globalThis & Record<string, unknown>).CheckCircle2 = CheckCircle2;
(globalThis as typeof globalThis & Record<string, unknown>).Cloud = Cloud;
(globalThis as typeof globalThis & Record<string, unknown>).Code = Code;
(globalThis as typeof globalThis & Record<string, unknown>).Copy = Copy;
(globalThis as typeof globalThis & Record<string, unknown>).Cpu = Cpu;
(globalThis as typeof globalThis & Record<string, unknown>).Github = Github;
(globalThis as typeof globalThis & Record<string, unknown>).Info = Info;
(globalThis as typeof globalThis & Record<string, unknown>).Play = Play;
(globalThis as typeof globalThis & Record<string, unknown>).RotateCcw = RotateCcw;
(globalThis as typeof globalThis & Record<string, unknown>).Search = Search;
(globalThis as typeof globalThis & Record<string, unknown>).Server = Server;
(globalThis as typeof globalThis & Record<string, unknown>).Terminal = Terminal;
(globalThis as typeof globalThis & Record<string, unknown>).Volume2 = Volume2;
(globalThis as typeof globalThis & Record<string, unknown>).VolumeX = VolumeX;
(globalThis as typeof globalThis & Record<string, unknown>).X = X;

${starterGlobalLoaders}

await loadRaktaGlobals();

const raktaElementStyle = document.createElement("style");
raktaElementStyle.textContent = \`
click {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  text-decoration: none;
}

click * {
  cursor: pointer !important;
}

photo {
  display: inline-block;
  line-height: 0;
}

photo img {
  display: block;
  width: 100%;
  height: 100%;
}
\`;
document.head.appendChild(raktaElementStyle);

const photoAttributeMap = {
  path: "src",
  alt: "alt",
  title: "title",
  width: "width",
  height: "height",
  loading: "loading",
  draggable: "draggable",
} as const;

function syncPhotoElement(photoElement: Element): void {
  let imageElement = photoElement.querySelector<HTMLImageElement>("img[data-rakta-photo]");

  if (!imageElement) {
    imageElement = document.createElement("img");
    imageElement.dataset.raktaPhoto = "true";
    photoElement.replaceChildren(imageElement);
  }

  for (const [sourceAttribute, imageAttribute] of Object.entries(photoAttributeMap)) {
    const value = photoElement.getAttribute(sourceAttribute);

    if (value === null) {
      imageElement.removeAttribute(imageAttribute);
    } else {
      imageElement.setAttribute(imageAttribute, value);
    }
  }

  imageElement.decoding = photoElement.getAttribute("priority") === "true" ? "sync" : "async";
}

function syncRaktaElements(): void {
  document.querySelectorAll("photo").forEach(syncPhotoElement);
}

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
  if (to === "/shrimprun") {
    document.getElementById("shrimprun")?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.history.pushState({ source: "rakta-click", to }, "", to);
    return;
  }

  window.history.pushState({ source: "rakta-click", to }, "", to);
  window.dispatchEvent(new PopStateEvent("popstate", { state: { to } }));
}

function isExternalTo(to: string): boolean {
  return (
    to.startsWith("http://") ||
    to.startsWith("https://") ||
    to.startsWith("//") ||
    to.startsWith("mailto:") ||
    to.startsWith("tel:")
  );
}

function openExternalTo(to: string, target: string | null): void {
  if (target === null || target === "_blank") {
    window.open(to, "_blank", "noopener,noreferrer");
    return;
  }

  window.location.assign(to);
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

      if (!to) {
        return;
      }

      event.preventDefault();

      if (isExternalTo(to)) {
        openExternalTo(to, clickElement.getAttribute("target"));
        return;
      }

      navigate(to);
      setPathname(window.location.pathname);
    }

    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key !== "Enter") {
        return;
      }

      const target = event.target;

      if (!(target instanceof Element)) {
        return;
      }

      const clickElement = target.closest("click");

      if (!clickElement) {
        return;
      }

      const to = clickElement.getAttribute("to");

      if (!to) {
        return;
      }

      event.preventDefault();

      if (isExternalTo(to)) {
        openExternalTo(to, clickElement.getAttribute("target"));
        return;
      }

      navigate(to);
      setPathname(window.location.pathname);
    }

    window.addEventListener("popstate", handlePopState);
    document.addEventListener("click", handleClick);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      document.removeEventListener("click", handleClick);
      document.removeEventListener("keydown", handleKeyDown);
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

  useEffect(() => {
    const animationFrameId = window.requestAnimationFrame(syncRaktaElements);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [Page, pathname]);

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
