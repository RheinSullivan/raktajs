import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { scanForExports } from "../auto-import/scanner";
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

function buildStarterGlobalLoaders(
	options: ClientEntryOptions,
	entryPath: string,
): string {
	const loaders: string[] = [];

	const discovered = scanForExports({
		frontendRoot: options.projectRoot,
		directories: ["app", "components", "lib", "stores", "schemas", "utils"],
		outputDirectory: ".rakta",
	});

	let index = 0;
	for (const item of discovered) {
		const fullPath = join(options.projectRoot, item.filePath);
		if (!existsSync(fullPath)) continue;

		const specifier = toModuleSpecifier(entryPath, fullPath);
		const names = new Set<string>();
		if (item.name) names.add(item.name);
		if (item.simpleName) names.add(item.simpleName);

		const assignments = Array.from(names)
			.map(
				(n) =>
					`    (globalThis as typeof globalThis & Record<string, unknown>).${n} = exp_${index};`,
			)
			.join("\n");

		loaders.push(`  try {
    const mod_${index} = await import("${specifier}");
    const exp_${index} = mod_${index}.default || mod_${index}.${item.name} || mod_${index};
    if (exp_${index}) {
${assignments}
    }
    for (const [k, v] of Object.entries(mod_${index})) {
      if (k !== "default" && typeof k === "string") {
        (globalThis as typeof globalThis & Record<string, unknown>)[k] = v;
      }
    }
  } catch (err) {}`);

		index++;
	}

	const audioPath = findExistingModule(join(options.appDir, "utils", "audio"));

	if (audioPath !== undefined) {
		loaders.push(`  try {
    const audioModule = await import("${toModuleSpecifier(entryPath, audioPath)}");
    (globalThis as typeof globalThis & Record<string, unknown>).getMuteState = audioModule.getMuteState;
    (globalThis as typeof globalThis & Record<string, unknown>).playGameOverSound = audioModule.playGameOverSound;
    (globalThis as typeof globalThis & Record<string, unknown>).playJumpSound = audioModule.playJumpSound;
    (globalThis as typeof globalThis & Record<string, unknown>).playScoreSound = audioModule.playScoreSound;
    (globalThis as typeof globalThis & Record<string, unknown>).setMute = audioModule.setMute;
  } catch (err) {}`);
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
	const starterGlobalLoaders = buildStarterGlobalLoaders(options, entryPath);

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
	LuCoffee as Coffee,
	LuCopy as Copy,
	LuCpu as Cpu,
	LuGithub as Github,
	LuGlobe as Globe,
	LuHeart as Heart,
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
(globalThis as typeof globalThis & Record<string, unknown>).Coffee = Coffee;
(globalThis as typeof globalThis & Record<string, unknown>).Copy = Copy;
(globalThis as typeof globalThis & Record<string, unknown>).Cpu = Cpu;
(globalThis as typeof globalThis & Record<string, unknown>).Github = Github;
(globalThis as typeof globalThis & Record<string, unknown>).Globe = Globe;
(globalThis as typeof globalThis & Record<string, unknown>).Heart = Heart;
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

function setupRaktaDevToolsAndPreview(): void {
	if (typeof document === "undefined") return;

	const urlPreview = document.createElement("div");
	urlPreview.id = "rakta-url-preview";
	Object.assign(urlPreview.style, {
		position: "fixed",
		bottom: "6px",
		left: "6px",
		zIndex: "999998",
		background: "#18181b",
		color: "#38bdf8",
		border: "1px solid #3f3f46",
		borderRadius: "4px",
		padding: "3px 8px",
		fontFamily: "ui-monospace, SFMono-Regular, Consolas, monospace",
		fontSize: "11px",
		pointerEvents: "none",
		opacity: "0",
		transform: "translateY(2px)",
		transition: "opacity 0.15s ease, transform 0.15s ease",
		boxShadow: "0 4px 12px rgba(0,0,0,0.6)",
	});
	document.body.appendChild(urlPreview);

	document.addEventListener("mouseover", (event) => {
		const target = event.target;
		if (!(target instanceof Element)) return;
		const clickElem = target.closest("click");
		if (!clickElem) return;
		const to = clickElem.getAttribute("to");
		if (!to) return;

		const fullUrl = isExternalTo(to)
			? to
			: \`\${window.location.origin}\${to.startsWith("/") ? "" : "/"}\${to}\`;
		urlPreview.textContent = fullUrl;
		urlPreview.style.opacity = "1";
		urlPreview.style.transform = "translateY(0)";
	});

	document.addEventListener("mouseout", (event) => {
		const target = event.target;
		if (!(target instanceof Element)) return;
		if (target.closest("click")) {
			urlPreview.style.opacity = "0";
			urlPreview.style.transform = "translateY(2px)";
		}
	});

	const devToolsContainer = document.createElement("div");
	devToolsContainer.id = "rakta-devtools-container";
	Object.assign(devToolsContainer.style, {
		position: "fixed",
		bottom: "16px",
		left: "16px",
		zIndex: "999999",
		fontFamily:
			"system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
	});

	const devToolsBtn = document.createElement("button");
	devToolsBtn.id = "rakta-devtools-btn";
	devToolsBtn.title = "Rakta.js DevTools";
	Object.assign(devToolsBtn.style, {
		width: "36px",
		height: "36px",
		borderRadius: "50%",
		background: "#000",
		border: "1px solid rgba(255, 255, 255, 0.25)",
		boxShadow: "0 4px 14px rgba(0, 0, 0, 0.7)",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		cursor: "pointer",
		transition: "transform 0.15s ease, border-color 0.15s ease",
		color: "#fff",
	});
	devToolsBtn.innerHTML = \`<svg width="20" height="20" viewBox="0 0 32 32" fill="none"><path d="M16 2L4 8v16l12 6 12-6V8L16 2z" stroke="#E11D48" stroke-width="2.5" fill="#000"/><path d="M11 12h10M11 16h8M11 20h6" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>\`;

	const devToolsPanel = document.createElement("div");
	devToolsPanel.id = "rakta-devtools-panel";
	Object.assign(devToolsPanel.style, {
		position: "absolute",
		bottom: "46px",
		left: "0",
		width: "250px",
		background: "#09090b",
		border: "1px solid rgba(255, 255, 255, 0.15)",
		borderRadius: "14px",
		padding: "14px",
		boxShadow: "0 12px 36px rgba(0,0,0,0.85)",
		display: "none",
		flexDirection: "column",
		gap: "10px",
		color: "#f4f4f5",
		fontSize: "13px",
		backdropFilter: "blur(12px)",
	});

	devToolsPanel.innerHTML = \`
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <span style="color: #a1a1aa; font-size: 13px;">Route</span>
      <span style="font-weight: 600; color: #fff; font-size: 13px;">Static</span>
    </div>
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <span style="color: #a1a1aa; font-size: 13px;">Bundler</span>
      <span style="font-weight: 600; color: #e11d48; font-size: 13px;">CherbonsEngine</span>
    </div>
    <div style="display: flex; justify-content: space-between; align-items: center; cursor: pointer;">
      <span style="color: #a1a1aa; font-size: 13px;">Route Info</span>
      <span style="color: #71717a; font-size: 13px;">&rsaquo;</span>
    </div>
    <div style="border-top: 1px solid rgba(255,255,255,0.1); margin-top: 4px; padding-top: 10px; display: flex; justify-content: space-between; align-items: center; font-size: 13px; color: #eee; cursor: pointer;">
      <span>Preferences</span>
      <span style="font-size: 13px; color: #71717a;">⚙</span>
    </div>
  \`;

	let isOpen = false;
	devToolsBtn.addEventListener("click", (e) => {
		e.stopPropagation();
		isOpen = !isOpen;
		devToolsPanel.style.display = isOpen ? "flex" : "none";
	});

	document.addEventListener("click", (e) => {
		if (isOpen && !devToolsContainer.contains(e.target as Node)) {
			isOpen = false;
			devToolsPanel.style.display = "none";
		}
	});

	devToolsContainer.appendChild(devToolsPanel);
	devToolsContainer.appendChild(devToolsBtn);
	document.body.appendChild(devToolsContainer);
}

setupRaktaDevToolsAndPreview();

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
