import type { RouteManifestEntry, MatchedRoute, RouteSegment } from "./types.js";

function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildPatternRegex(segments: RouteSegment[]): {
  regex: RegExp;
  paramNames: string[];
} {
  const paramNames: string[] = [];

  const parts = segments.map((segment) => {
    if (segment.isDynamic && segment.paramName) {
      paramNames.push(segment.paramName);
      // Match any non-slash sequence for the param
      return "([^/]+)";
    }
    return escapeRegex(segment.raw);
  });

  const pattern = parts.length === 0 ? "" : "/" + parts.join("/");
  const regex = new RegExp(`^${pattern || "/"}$`);

  return { regex, paramNames };
}

export function matchRoute(
  pathname: string,
  routes: RouteManifestEntry[]
): MatchedRoute | null {
  // Normalize pathname: strip trailing slash unless root
  const normalized =
    pathname !== "/" && pathname.endsWith("/")
      ? pathname.slice(0, -1)
      : pathname;

  for (const entry of routes) {
    // Only match pages and api routes
    if (entry.kind !== "page" && entry.kind !== "api") continue;

    const { regex, paramNames } = buildPatternRegex(entry.segments);
    const match = regex.exec(normalized);

    if (!match) continue;

    const params: Record<string, string> = {};
    paramNames.forEach((name, index) => {
      const captured = match[index + 1];
      if (captured !== undefined) {
        params[name] = decodeURIComponent(captured);
      }
    });

    return { entry, params };
  }

  return null;
}

export function findLayoutsForPathname(
  pathname: string,
  routes: RouteManifestEntry[]
): RouteManifestEntry[] {
  const layoutRoutes = routes.filter((route) => route.kind === "layout");

  return layoutRoutes.filter((layout) => {
    if (layout.urlPattern === "/") return true;
    return (
      pathname === layout.urlPattern ||
      pathname.startsWith(layout.urlPattern + "/")
    );
  });
}

export function findSpecialRoute(
  kind: "loading" | "not-found" | "error",
  pathname: string,
  routes: RouteManifestEntry[]
): RouteManifestEntry | null {
  const candidates = routes.filter((route) => route.kind === kind);

  // Find the most specific match (longest matching prefix)
  let best: RouteManifestEntry | null = null;
  let bestLength = -1;

  for (const candidate of candidates) {
    const prefix = candidate.urlPattern === "/" ? "" : candidate.urlPattern;
    if (pathname.startsWith(prefix) && prefix.length > bestLength) {
      best = candidate;
      bestLength = prefix.length;
    }
  }

  return best;
}