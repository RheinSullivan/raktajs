// packages/rakta/src/index.ts
// Main barrel export for the `rakta` package.

// Components
export { Link, Image, Click, Photo } from "./components/index";
export type { LinkProps, ImageProps, ClickProps, PhotoProps, PhotoFormat } from "./components/index";

// Router
export {
  scanRoutes,
  generateManifest,
  writeManifest,
  readManifest,
  printManifest,
  matchRoute,
  findLayoutsForPathname,
  findSpecialRoute,
} from "./router/index";
export type {
  RouteKind,
  RouteSegment,
  RouteManifestEntry,
  RouteManifest,
  MatchedRoute,
  RouteContext,
  PageProps,
  LayoutProps,
  ApiMethod,
  ApiRouteHandler,
  ApiRouteModule,
  GenerateMetadataFn,
} from "./router/index";

// SEO
export {
  RaktaHead,
  resolveTitle,
  resolveRobotsContent,
  mergeMetadata,
  generateSitemapXml,
  createSitemapHandler,
  generateSitemapIndexXml,
  generateRobotsTxt,
  createRobotsHandler,
} from "./seo/index";

export type {
  Metadata,
  OpenGraph,
  OpenGraphImage,
  TwitterCard,
  JsonLd,
  AlternateLinks,
  Robots,
  SitemapEntry,
  SitemapOptions,
  RobotsRule,
  RobotsOptions,
} from "./seo/index";

// Config
export { defineConfig, defineRaktaConfig, defaultConfig } from "./config/index";
export { loadConfig, mergeConfig } from "./config/index";
export type {
  RaktaConfig,
  CssConfig,
  SeoConfig,
  ServerConfig,
  BuildConfig,
  AutoImportConfig,
  RpcConfig,
} from "./config/index";

// Render
export {
  RENDER_MODE_DESCRIPTORS,
  resolveRouteMode,
  getModeDescriptor,
  isRoadmapMode,
  requiresServer,
  isBuildTimeMode,
  render,
  renderNotFound,
  renderServerError,
} from "./render/index";

export type {
  RenderMode,
  RenderConfig,
  RouteRenderMap,
  ResolvedRouteMode,
  RenderModeDescriptor,
  RenderContext,
  RenderResult,
  RenderSuccess,
  RenderFailure,
  StaticEntry,
} from "./render/index";

// Schema
export { string, number, boolean, object, array } from "./schema/index";
export { RaktaType, OptionalType } from "./schema/index";
export { RaktaSchemaError } from "./schema/index";
export type {
  ValidationError,
  ParseResult,
  ParseSuccess,
  ParseFailure,
  Infer,
  ShapeRecord,
  InferShape,
} from "./schema/index";

// RPC
export { createRaktaRouter, createRpcHandler } from "./rpc/index";
export { createRaktaClient, RaktaRpcError } from "./rpc/index";
export { publicProcedure } from "./rpc/index";
export type {
  ProcedureDefinition,
  RouterDefinition,
  RouterClient,
  RpcEnvelope,
  InferInput,
  InferOutput,
  RaktaClientConfig,
} from "./rpc/index";

// Store
export { createRaktaStore } from "./store/index";
export type {
  SetStateFn,
  GetStateFn,
  SelectorFn,
  StateCreator,
  StoreApi,
} from "./store/index";

// HTTP
export { createRaktaHttp, RaktaHttpClient } from "./http/index";
export { HttpResponseError, HttpTimeoutError, HttpNetworkError } from "./http/index";
export type {
  HttpClientConfig,
  HttpRequestConfig,
  HttpMethod,
} from "./http/index";

// Auto Import
export { generateAutoImports, scanForExports } from "./auto-import/index";
export type {
  DiscoveredExport,
  AutoImportManifest,
  AutoImportGeneratorOptions,
} from "./auto-import/index";

// Forge
export { startDevServer, buildProject, inspectBuild, printInspectReport } from "./forge/index";
export type {
  ForgeBuildResult,
  ForgeInspectReport,
  ForgeDevServerHandle,
} from "./forge/index";

// Tide
export { createBunAdapter } from "./tide/index";
export type { TideAdapter, TideAdapterConfig } from "./tide/index";