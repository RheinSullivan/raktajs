export const RAKTA_NAME = "Rakta.js";
export const RAKTA_VERSION = "0.1.0";
export const RAKTA_TAGLINE =
	"Small in size. Fierce in speed. Alive in every route.";

export type {
	AutoImportGeneratorOptions,
	AutoImportKind,
	AutoImportManifest,
	DiscoveredExport,
	ScanForExportsOptions,
} from "./auto-import/index";
// Auto Import — TrusmiThread
export {
	generateAutoImports,
	printAutoImportSummary,
	scanForExports,
} from "./auto-import/index";
export type {
	ClickProps,
	PictureProps,
	PictureProps as PhotoProps,
} from "./components/index";
// Components
export {
	Click,
	Picture,
	Picture as Photo,
} from "./components/index";
export type {
	AutoImportConfig,
	BuildConfig,
	CorsConfig,
	CssConfig,
	RaktaConfig,
	RpcConfig,
	SeoConfig,
	ServerConfig,
} from "./config/index";
// Config
export {
	defaultConfig,
	defineConfig,
	defineRaktaConfig,
	loadConfig,
	mergeConfig,
} from "./config/index";
export type {
	ArtifactKind,
	ForgeBuildArtifact,
	ForgeBuildOptions,
	ForgeBuildResult,
	ForgeDevServerHandle,
	ForgeDevServerOptions,
	ForgeInspectReport,
	ForgeRouteModeEntry,
	InspectOptions,
} from "./forge/index";
// Forge — CherbonsEngine
export {
	buildProject,
	inspectBuild,
	printInspectReport,
	startDevServer,
} from "./forge/index";
export type {
	HttpClientConfig,
	HttpJsonArray,
	HttpJsonObject,
	HttpJsonPrimitive,
	HttpJsonValue,
	HttpMethod,
	HttpQueryParams,
	HttpQueryValue,
	HttpRequestBody,
	HttpRequestConfig,
	RequestInterceptorFn,
	ResponseInterceptorFn,
} from "./http/index";
// HTTP — PanturaFetch
export {
	createRaktaHttp,
	HttpNetworkError,
	HttpResponseError,
	HttpTimeoutError,
	RaktaHttpClient,
} from "./http/index";
export type {
	HybridRouteEntry,
	RenderConfig,
	RenderContext,
	RendererOptions,
	RenderFailure,
	RenderMode,
	RenderModeDescriptor,
	RenderResult,
	RenderSource,
	RenderSuccess,
	ResolvedRouteMode,
	RouteRenderMap,
	StaticEntry,
} from "./render/index";
// Render
export {
	getModeDescriptor,
	isBuildTimeMode,
	isRoadmapMode,
	RENDER_MODE_DESCRIPTORS,
	render,
	renderNotFound,
	renderServerError,
	requiresServer,
	resolveRouteMode,
} from "./render/index";
export type {
	ApiMethod,
	ApiRouteHandler,
	ApiRouteModule,
	GenerateMetadataFn,
	LayoutProps,
	MatchedRoute,
	PageProps,
	RouteContext,
	RouteKind,
	RouteManifest,
	RouteManifestEntry,
	RouteSegment,
} from "./router/index";
// Router
export {
	findLayoutsForPathname,
	findSpecialRoute,
	generateManifest,
	matchRoute,
	printManifest,
	readManifest,
	scanRoutes,
	writeManifest,
} from "./router/index";
export type {
	InferInput,
	InferOutput,
	ProcedureDefinition,
	ProcedureKind,
	RaktaClientConfig,
	RouterClient,
	RouterDefinition,
	RpcEnvelope,
	RpcErrorEnvelope,
	RpcPayload,
	RpcSuccessEnvelope,
} from "./rpc/index";
// RPC
export {
	createRaktaClient,
	createRaktaRouter,
	createRpcHandler,
	ProcedureBuilder,
	publicProcedure,
	RaktaRpcError,
} from "./rpc/index";
export type {
	Infer,
	InferShape,
	ParseFailure,
	ParseResult,
	ParseSuccess,
	ShapeRecord,
	ValidationError,
} from "./schema/index";
// Schema
export {
	ArrayType,
	array,
	BooleanType,
	boolean,
	NumberType,
	number,
	ObjectType,
	OptionalType,
	object,
	preFixErrors,
	RaktaSchemaError,
	RaktaType,
	StringType,
	string,
} from "./schema/index";
export type {
	AlternateLinks,
	HeadProps,
	JsonLd,
	JsonLdGraph,
	Metadata,
	OpenGraph,
	OpenGraphImage,
	Robots,
	RobotsOptions,
	RobotsRule,
	SitemapEntry,
	SitemapIndexEntry,
	SitemapOptions,
	TwitterCard,
} from "./seo/index";
// SEO
export {
	createRobotsHandler,
	createSitemapHandler,
	generateRobotsTxt,
	generateSitemapIndexXml,
	generateSitemapXml,
	mergeMetadata,
	RaktaHead,
	resolveRobotsContent,
	resolveTitle,
} from "./seo/index";
export type {
	GetStateFn,
	ListenerFn,
	SelectorFn,
	SetStateArg,
	SetStateFn,
	StateCreator,
	StoreApi,
	UnsubscribeFn,
} from "./store/index";
// Store
export { createRaktaStore } from "./store/index";
export type {
	TideAdapter,
	TideAdapterConfig,
	TideAdapterKind,
	TideRender,
	TideRenderStrategyResult,
	TideResponseBlueprint,
	TideRuntimeContext,
} from "./tide/index";
// Tide — NorthCoastFlow
export {
	buildErrorResponse,
	buildHtmlResponse,
	buildJsonResponse,
	buildTextResponse,
	createBunAdapter,
	createRuntimeContext,
} from "./tide/index";
