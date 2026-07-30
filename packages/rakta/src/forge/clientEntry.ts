import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
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

	// Embed the Rakta.js SVG logo as a base64 data URL so the dev indicator
	// has no runtime filesystem dependency. Computed once at bundle time.
	const svgCandidates = [
		join(options.projectRoot, "docs", "assets", "Rakta.js.svg"),
		join(options.projectRoot, "..", "..", "docs", "assets", "Rakta.js.svg"),
		join(__dirname, "..", "..", "..", "..", "docs", "assets", "Rakta.js.svg"),
	];
	const svgPath = svgCandidates.find((p) => existsSync(p));
	const logoDataUrl = svgPath
		? `data:image/svg+xml;base64,${readFileSync(svgPath).toString("base64")}`
		: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMiAzMiI+PHBhdGggZmlsbD0iI0M2MDAwNSIgZD0iTTE2IDJMNCA4djE2bDEyIDYgMTItNlY4TDE2IDJ6Ii8+PC9zdmc+";

	// Resolve path to devIndicator module relative to the generated entry file.
	// For browser bundles, we inline the devIndicator source directly from the
	// built dist file so there is no dynamic filesystem import at runtime.
	const devIndicatorDistPath = join(__dirname, "..", "dx", "devIndicator.js");
	const devIndicatorInline = existsSync(devIndicatorDistPath)
		? readFileSync(devIndicatorDistPath, "utf8")
				.replace(/^#!.*\n/, "") // strip shebang if any
				.replace(/export \{[^}]*\};?\s*$/m, "") // strip named exports
				.replace(/export function /g, "function ")
				.replace(/export const /g, "const ")
				.replace(/export class /g, "class ")
				.replace(/export interface /g, "// interface ")
				.replace(/export type /g, "// type ")
		: "";

	// Read version from package.json at build time.
	const pkgPath = join(
		options.projectRoot,
		"node_modules",
		"raktajs",
		"package.json",
	);
	let rVersion = "1.0.6";
	if (existsSync(pkgPath)) {
		try {
			const pkg = JSON.parse(readFileSync(pkgPath, "utf8")) as {
				version?: string;
			};
			if (typeof pkg.version === "string") rVersion = pkg.version;
		} catch {
			// fall back to default
		}
	}
	const rVersionSafe = rVersion.replace(/"/g, "");
	const logoDataUrlSafe = logoDataUrl
		.replace(/\\/g, "\\\\")
		.replace(/`/g, "\\`");
	const layoutPath = findExistingModule(join(options.appDir, "layout"));
	const layoutImport = layoutPath
		? `import RootLayout from "${toModuleSpecifier(entryPath, layoutPath)}";\n`
		: "const RootLayout = null;\n";

	return `import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import * as ReactHooks from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { RaktaHead } from "raktajs/seo";
import {
	RaktaToast,
	Toaster,
	RaktaAlert,
	Alert,
	Pantura,
	Reborns,
	usePantura,
	toast,
	useToast,
} from "raktajs/components";
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
${layoutImport}
(globalThis as typeof globalThis & Record<string, unknown>).useCallback = ReactHooks.useCallback;
(globalThis as typeof globalThis & Record<string, unknown>).useEffect = ReactHooks.useEffect;
(globalThis as typeof globalThis & Record<string, unknown>).useMemo = ReactHooks.useMemo;
(globalThis as typeof globalThis & Record<string, unknown>).useRef = ReactHooks.useRef;
(globalThis as typeof globalThis & Record<string, unknown>).useState = ReactHooks.useState;
(globalThis as typeof globalThis & Record<string, unknown>).RaktaHead = RaktaHead;
(globalThis as typeof globalThis & Record<string, unknown>).RaktaToast = RaktaToast;
(globalThis as typeof globalThis & Record<string, unknown>).Toaster = Toaster;
(globalThis as typeof globalThis & Record<string, unknown>).RaktaAlert = RaktaAlert;
(globalThis as typeof globalThis & Record<string, unknown>).Alert = Alert;
(globalThis as typeof globalThis & Record<string, unknown>).Pantura = Pantura;
(globalThis as typeof globalThis & Record<string, unknown>).Reborns = Reborns;
(globalThis as typeof globalThis & Record<string, unknown>).usePantura = usePantura;
(globalThis as typeof globalThis & Record<string, unknown>).toast = toast;
(globalThis as typeof globalThis & Record<string, unknown>).useToast = useToast;
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
(globalThis as typeof globalThis & Record<string, unknown>).gsap = gsap;
(globalThis as typeof globalThis & Record<string, unknown>).ScrollTrigger = ScrollTrigger;
(globalThis as typeof globalThis & Record<string, unknown>).ScrollToPlugin = ScrollToPlugin;
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

function setupUrlPreview(): void {
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
}

setupUrlPreview();

// Dev Indicator - development only. Inlined at build time, no dynamic import.
if (process.env.NODE_ENV === "development") {
  ${devIndicatorInline}
  if (typeof mountDevIndicator === "function") {
    mountDevIndicator({
      version: "${rVersionSafe}",
      logoDataUrl: \`${logoDataUrlSafe}\`,
      bundler: "Bun / Vite (CherbonsEngine)",
    });
  }
}

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

class RaktaErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[Rakta.js Runtime Error]:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const msg = this.state.error?.message || "An unknown error occurred.";
      const stack = this.state.error?.stack || "";
      return React.createElement(
        "div",
        {
          style: {
            minHeight: "100vh",
            background: "#050505",
            color: "#f43f5e",
            padding: "2rem",
            fontFamily: "ui-monospace, SFMono-Regular, Consolas, monospace",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          },
        },
        React.createElement("div", {
          style: {
            maxWidth: "750px",
            width: "100%",
            background: "#09090b",
            border: "1px solid #27272a",
            borderRadius: "1rem",
            padding: "1.5rem",
            boxShadow: "0 20px 25px -5px rgba(0,0,0,0.5)",
          },
        },
          React.createElement("h2", { style: { fontSize: "1.25rem", color: "#ef4444", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" } }, "⚠️ Rakta.js Application Error"),
          React.createElement("p", { style: { color: "#e2e8f0", fontSize: "0.95rem", marginBottom: "1rem" } }, msg),
          stack ? React.createElement("pre", { style: { background: "#18181b", padding: "1rem", borderRadius: "0.5rem", color: "#a1a1aa", fontSize: "0.8rem", overflowX: "auto", maxHeight: "250px" } }, stack) : null,
          React.createElement("button", {
            onClick: () => window.location.reload(),
            style: { marginTop: "1rem", padding: "0.5rem 1.25rem", background: "#dc2626", color: "#fff", border: "none", borderRadius: "0.375rem", cursor: "pointer", fontWeight: 600 }
          }, "Reload Application")
        )
      );
    }
    return this.props.children;
  }
}

function RaktaAppShell(): React.ReactElement {
  const [pathname, setPathname] = useState(() => window.location.pathname);
  const [Page, setPage] = useState<React.ComponentType | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

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
    setLoadError(null);

    const loader = resolveRouteLoader(pathname);
    if (typeof loader !== "function") {
      setLoadError(\`Route loader not found for pathname \${pathname}\`);
      return;
    }

    loader().then((pageModule) => {
      if (isCurrent) {
        setPage(() => pageModule.default);
      }
    }, (err) => {
      console.error("[Rakta.js Route Import Error]:", err);
      if (isCurrent) {
        setLoadError(err instanceof Error ? err.message : String(err));
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

  if (loadError) {
    return React.createElement("main", {
      style: {
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "#050505",
        color: "#ef4444",
        fontFamily: "ui-monospace, SFMono-Regular, Consolas, monospace",
        padding: "2rem",
      },
    }, \`Failed to load route: \${loadError}\`);
  }

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

  const pageElement = React.createElement(Page);
  if (typeof RootLayout === "function") {
    return React.createElement(RootLayout, null, pageElement);
  }
  return pageElement;
}

const rootElement = document.getElementById("rakta-root");

if (!rootElement) {
  throw new Error("Rakta.js root element #rakta-root was not found.");
}

createRoot(rootElement).render(
  React.createElement(RaktaErrorBoundary, null, React.createElement(RaktaAppShell))
);

// Notify the HTML shell that the app has mounted so the loading overlay
// can be dismissed. This fires after React's first commit.
requestAnimationFrame(function() {
  document.dispatchEvent(new Event("rakta:mounted"));
});
`;
}

export function writeClientEntry(options: ClientEntryOptions): string {
	mkdirSync(options.workDir, { recursive: true });

	const entryPath = join(options.workDir, "client-entry.tsx");
	const entrySource = buildClientEntrySource(options, entryPath);

	writeFileSync(entryPath, entrySource, "utf-8");

	return entryPath;
}
