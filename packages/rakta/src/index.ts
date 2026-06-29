export const RAKTA_NAME = "Rakta.js";
export const RAKTA_VERSION = "0.1.0";
export const RAKTA_TAGLINE =
	"Small in size. Fierce in speed. Alive in every route.";

// Components
export {
	Click,
	Picture,
	Picture as Photo,
} from "./components/index";

export type {
	ClickProps,
	PictureProps,
	PictureProps as PhotoProps,
} from "./components/index";

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
	HeadProps,
	Metadata,
	OpenGraph,
	OpenGraphImage,
	TwitterCard,
	JsonLd,
	JsonLdGraph,
	AlternateLinks,
	Robots,
	SitemapEntry,
	SitemapOptions,
	SitemapIndexEntry,
	RobotsRule,
	RobotsOptions,
} from "./seo/index";

// Config
export {
	defineConfig,
	defineRaktaConfig,
	defaultConfig,
	loadConfig,
	mergeConfig,
} from "./config/index";

export type {
	RaktaConfig,
	CssConfig,
	SeoConfig,
	ServerConfig,
	CorsConfig,
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
	RendererOptions,
	RenderMode,
	RenderSource,
	RenderConfig,
	RouteRenderMap,
	ResolvedRouteMode,
	RenderModeDescriptor,
	RenderContext,
	RenderSuccess,
	RenderFailure,
	RenderResult,
	StaticEntry,
	HybridRouteEntry,
} from "./render/index";

// Schema
export {
	string,
	StringType,
	number,
	NumberType,
	boolean,
	BooleanType,
	object,
	ObjectType,
	array,
	ArrayType,
	RaktaType,
	OptionalType,
	RaktaSchemaError,
	preFixErrors,
} from "./schema/index";

export type {
	ValidationError,
	ParseSuccess,
	ParseFailure,
	ParseResult,
	Infer,
	ShapeRecord,
	InferShape,
} from "./schema/index";

// RPC
export {
	createRaktaRouter,
	createRpcHandler,
	createRaktaClient,
	RaktaRpcError,
	publicProcedure,
	ProcedureBuilder,
} from "./rpc/index";

export type {
	ProcedureKind,
	RpcPayload,
	RpcSuccessEnvelope,
	RpcErrorEnvelope,
	RpcEnvelope,
	ProcedureDefinition,
	RouterDefinition,
	InferInput,
	InferOutput,
	RouterClient,
	RaktaClientConfig,
} from "./rpc/index";

// Store
export { createRaktaStore } from "./store/index";

export type {
	SetStateArg,
	SetStateFn,
	GetStateFn,
	SelectorFn,
	ListenerFn,
	UnsubscribeFn,
	StateCreator,
	StoreApi,
} from "./store/index";

// HTTP — PanturaFetch
export {
	createRaktaHttp,
	RaktaHttpClient,
	HttpResponseError,
	HttpTimeoutError,
	HttpNetworkError,
} from "./http/index";

export type {
	HttpMethod,
	HttpQueryValue,
	HttpQueryParams,
	HttpJsonPrimitive,
	HttpJsonValue,
	HttpJsonObject,
	HttpJsonArray,
	HttpRequestBody,
	HttpClientConfig,
	HttpRequestConfig,
	RequestInterceptorFn,
	ResponseInterceptorFn,
} from "./http/index";

// Auto Import — TrusmiThread
export {
	generateAutoImports,
	printAutoImportSummary,
	scanForExports,
} from "./auto-import/index";

export type {
	AutoImportKind,
	DiscoveredExport,
	AutoImportManifest,
	AutoImportGeneratorOptions,
	ScanForExportsOptions,
} from "./auto-import/index";

// Forge — CherbonsEngine
export {
	startDevServer,
	buildProject,
	inspectBuild,
	printInspectReport,
} from "./forge/index";

export type {
	ForgeDevServerOptions,
	ForgeBuildOptions,
	ForgeBuildArtifact,
	ForgeBuildResult,
	ForgeInspectReport,
	ForgeDevServerHandle,
	ForgeRouteModeEntry,
	ArtifactKind,
	InspectOptions,
} from "./forge/index";

// Tide — NorthCoastFlow
export {
	createBunAdapter,
	createRuntimeContext,
	buildTextResponse,
	buildHtmlResponse,
	buildJsonResponse,
	buildErrorResponse,
} from "./tide/index";

export type {
	TideAdapterKind,
	TideAdapter,
	TideRuntimeContext,
	TideResponseBlueprint,
	TideAdapterConfig,
	TideRender,
	TideRenderStrategyResult,
} from "./tide/index";
