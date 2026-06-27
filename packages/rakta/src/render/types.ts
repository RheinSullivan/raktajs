/** All supported rendering modes in Rakta.js. */
export type RenderMode = "csr" | "ssr" | "ssg" | "csg" | "spa" | "hybrid";

/** Where the mode decision came from. */
export type RenderSource = "route-override" | "default";

/** Per-route render mode map. Keys are URL patterns, values are modes. */
export interface RouteRenderMap {
  readonly [routePattern: string]: RenderMode;
}

/** Render configuration block inside rakta.config.ts. */
export interface RenderConfig {
  readonly defaultMode: RenderMode;
  readonly routes: RouteRenderMap;
}

/** Result of resolving the render mode for a specific pathname. */
export interface ResolvedRouteMode {
  readonly routePath: string;
  readonly mode: RenderMode;
  readonly source: RenderSource;
}

/** Static descriptor for a render mode. */
export interface RenderModeDescriptor {
  readonly mode: RenderMode;
  readonly label: string;
  readonly shortLabel: string;
  readonly description: string;
  readonly serverRequired: boolean;
  readonly buildTimeGenerated: boolean;
  readonly clientHydration: boolean;
  /** True if this mode is planned but not yet implemented. */
  readonly roadmap: boolean;
}

/** Execution context passed to every renderer call. */
export interface RenderContext {
  readonly routePath: string;
  readonly mode: RenderMode;
  readonly params: Readonly<Record<string, string>>;
  readonly searchParams: Readonly<Record<string, string>>;
  readonly requestHeaders: Readonly<Record<string, string>>;
  readonly timestampMs: number;
}

/** Successful render outcome. */
export interface RenderSuccess {
  readonly kind: "success";
  readonly html: string;
  readonly mode: RenderMode;
  readonly httpStatus: number;
  readonly responseHeaders: Record<string, string>;
  readonly fromCache: boolean;
  readonly renderMs: number;
}

/** Failed render outcome. */
export interface RenderFailure {
  readonly kind: "failure";
  readonly reason: string;
  readonly mode: RenderMode;
  readonly httpStatus: number;
}

export type RenderResult = RenderSuccess | RenderFailure;

/** A pre-generated static page entry (SSG / CSG). */
export interface StaticEntry {
  readonly routePath: string;
  readonly html: string;
  readonly generatedAt: string;
  readonly mode: "ssg" | "csg";
  readonly sizeBytes: number;
}

/** Per-route mode assignment used inside a hybrid config. */
export interface HybridRouteEntry {
  readonly pattern: string;
  readonly mode: Exclude<RenderMode, "hybrid">;
}