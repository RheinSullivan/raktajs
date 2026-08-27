// API - REST helpers, GraphQL adapter, OpenAPI generation
export type {
	GraphQLHandlerOptions,
	GraphQLSchemaDefinition,
	OpenApiInfo,
	OpenApiOperation,
	OpenApiParameter,
	OpenApiParameterLocation,
	OpenApiPathItem,
	OpenApiResponseEntry,
	OpenApiSpec,
	PaginatedResponseBody,
	ParsedRouteParams,
} from "./api/index";
export {
	BadRequestResponse,
	createGraphQLHandler,
	defineOpenApiOperation,
	ForbiddenResponse,
	generateOpenApiSpec,
	InternalErrorResponse,
	introspectionEnabled,
	jsonError,
	jsonSuccess,
	NotFoundResponse,
	paginatedResponse,
	parsePagination,
	parseQueryString,
	parseRouteParams,
	serveSwaggerUI,
	UnauthorizedResponse,
	ValidationErrorResponse,
} from "./api/index";
// Auth - magic links + TOTP 2FA
export type { MagicLinkEmail, MagicLinkPayload } from "./auth/index";
export {
	createMagicLinkEmail,
	generateBackupCodes,
	generateMagicLinkToken,
	generateTotpSecret,
	generateTotpUri,
	verifyBackupCode,
	verifyMagicLinkToken,
	verifyTotp,
} from "./auth/index";
// Auto Import - TrusmiThread
export type {
	AutoImportGeneratorOptions,
	AutoImportKind,
	AutoImportManifest,
	DiscoveredExport,
	ScanForExportsOptions,
} from "./autoImport/index";
export {
	generateAutoImports,
	printAutoImportSummary,
	scanForExports,
} from "./autoImport/index";
// CLI
export type {
	AnalyzeReport,
	BenchmarkResult,
	CheckResult,
	DoctorCheck,
	DoctorReport,
	GenerateOptions,
	GenerateResult,
	GenerateTarget,
	InspectReport,
	TelemetryConfig,
} from "./cli/index";
export {
	analyzeCommand,
	benchmarkCommand,
	buildCommand,
	checkCommand,
	doctorCommand,
	generateCommand,
	inspectCommand,
	readTelemetryConfig,
	setTelemetryEnabled,
	startCommand,
} from "./cli/index";
// Components - ShrimpStep, TrusmiFrame, PanturaScroll, RaktaAlert, RaktaToast
export type {
	AlertType,
	ClickProps,
	FormProps,
	GuardProps,
	IslandMode,
	IslandProps,
	LazyProps,
	PanturaOptions,
	PanturaProps,
	PictureProps,
	PictureProps as PhotoProps,
	PrefetchAs,
	PrefetchProps,
	PrefetchWhen,
	RaktaAlertProps,
	RaktaExcludedCompatTag,
	RaktaOfficialCustomTag,
	RebornsProps,
	ResourceAs,
	ResourceProps,
	ResourceRel,
	RouteProps,
	SealProps,
	ShelfProps,
	TitleProps,
	ToastItem,
	ToastType,
} from "./components/index";
export {
	Alert,
	Click,
	Form,
	Guard,
	Island,
	Lazy,
	Pantura,
	Picture,
	Picture as Photo,
	Prefetch,
	RAKTA_EXCLUDED_COMPAT_TAGS,
	RAKTA_OFFICIAL_CUSTOM_TAGS,
	RaktaAlert,
	RaktaToast,
	Reborns,
	Resource,
	Route,
	Seal,
	Shelf,
	Title,
	Toaster,
	toast,
	usePantura,
	useToast,
} from "./components/index";
// Config
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
export {
	defaultConfig,
	defineConfig,
	defineRaktaConfig,
	loadConfig,
	mergeConfig,
} from "./config/index";
// Data
export type {
	IsrOptions,
	IsrResult,
	RaktaCacheEntry,
	RaktaCacheOptions,
	RaktaDataResult,
	RaktaDataState,
	RaktaDataStatus,
	RaktaRenderRuntime,
	RaktaRouteDataStrategy,
} from "./data/index";
export {
	cache,
	createDataCache,
	defer,
	defineRouteDataStrategy,
	isIncrementalRoute,
	isr,
	lazy,
	prefetch,
	RaktaDataCache,
	resolveRenderRuntime,
	revalidate,
	shouldPrefetchRoute,
	shouldStreamRoute,
	useRaktaData,
} from "./data/index";
// Deployment
export type {
	DeploymentAdapter,
	DeploymentAdapterOptions,
	DeploymentFile,
	DeploymentTarget,
} from "./deployment/index";
export {
	createDeploymentAdapter,
	listDeploymentTargets,
} from "./deployment/index";
// DX
export type {
	DevIndicatorOptions,
	DevTerminalOptions,
	RaktaBundleAnalysis,
	RaktaDependencyEdge,
	RaktaDependencyGraph,
	RaktaRouteAnalysis,
	RaktaSourceModule,
	RequestLogEntry,
} from "./developerExperience/index";
export {
	analyzeBundle,
	analyzeRoutes,
	createDependencyGraph,
	createDevTerminal,
	createErrorOverlay,
	createProfilerReport,
	detectEnvFiles,
	detectLanAddress,
	inspectAutoImports,
	mountDevIndicator,
	RAKTA_TERMINAL_GLYPH,
} from "./developerExperience/index";
// Docs
export type {
	RaktaDocsManifest,
	RaktaDocsOptions,
	RaktaDocsPage,
	RaktaDocsSearchItem,
	RaktaDocsSidebarItem,
	RaktaVitePressConfig,
} from "./docs/index";
export { createVitePressConfig, scanMarkdownDocs } from "./docs/index";
// Ecosystem - @rakta/auth, @rakta/forms, @rakta/database, @rakta/storage
export type {
	AuthConfig,
	AuthTokenPair,
	AuthUser,
	PasswordHasher,
} from "./ecosystem/auth";
export {
	createPasswordHasher,
	createTokenPair,
	signToken,
	verifyToken,
} from "./ecosystem/auth";
export type {
	DatabaseAdapter,
	DatabaseConfig,
	DatabaseDriver,
	QueryResult,
	Repository,
} from "./ecosystem/database";
export {
	buildConnectionString,
	createInMemoryRepository,
} from "./ecosystem/database";
export type {
	FieldError,
	FormErrors,
	FormState,
	FormValidator,
	SubmitHandler,
	ValidationRules,
} from "./ecosystem/forms";
export {
	createFormState,
	parseFormData,
	rules as formRules,
	validateForm,
} from "./ecosystem/forms";
// Image Optimization
export type {
	BlurPlaceholder,
	ImageBreakpoints,
	ImageCdnKind,
	ImageFormat,
	ImageOptimizeOptions,
	ResponsiveImageManifest,
	SrcSetEntry,
} from "./ecosystem/image";
export {
	buildOptimizedUrl,
	generateBlurPlaceholder,
	generateSrcSet,
	getImageDimensions,
	IMAGE_BREAKPOINTS,
	isAnimatedGif,
	normalizeFormat,
} from "./ecosystem/image";
// Mail
export type {
	MailAddress,
	MailAttachment,
	MailDriverKind,
	MailMessage,
	MailSendResult,
	MailTransport,
	MailTransportConfig,
	MailVariables,
} from "./ecosystem/mail";
export {
	buildHtmlEmail,
	createMailer,
	normalizeAddress,
	normalizeAddressList,
	renderMailTemplate,
	sendMail,
	sendTemplateMail,
} from "./ecosystem/mail";
export type {
	PackageStats,
	PackageStatsOptions,
} from "./ecosystem/packageStats";
export {
	fetchPackageStats,
	parseDependentsCount,
	parseRuntimeDependencies,
} from "./ecosystem/packageStats";
export type {
	StorageAdapter,
	StorageConfig,
	StorageDriver,
	StorageObject,
} from "./ecosystem/storage";
export { createMemoryStorage } from "./ecosystem/storage";
export type {
	ArtifactKind,
	BuildManifest,
	BuildManifestClient,
	BuildManifestRoute,
	BuildManifestServer,
	ForgeBuildArtifact,
	ForgeBuildOptions,
	ForgeBuildResult,
	ForgeDevServerHandle,
	ForgeDevServerOptions,
	ForgeInspectReport,
	ForgeRouteModeEntry,
	InspectOptions,
	SsgGenerateOptions,
	SsgGenerateResult,
	SsrBuildOptions,
	SsrBuildResult,
	ValidationIssue,
	ValidationResult,
} from "./forge/index";
export {
	BUILD_MANIFEST_VERSION,
	buildProject,
	buildServerEntry,
	createBuildManifest,
	formatValidationDiagnostics,
	generateStaticPages,
	readBuildManifest,
	validateAndReport,
	validateBuildManifest,
	writeBuildManifest,
	writeCsrIndexHtml,
} from "./forge/index";
export {
	applyRaktaDetectionHeaders,
	createRaktaDetectionHeaders,
	createRaktaRuntimeFingerprint,
	createRaktaWellKnownPayload,
	RAKTA_FRAMEWORK_ID,
	RAKTA_NAME,
	RAKTA_TAGLINE,
	RAKTA_VERSION,
	RAKTA_WEBSITE,
} from "./frameworkIdentity";
export {
	batuLawangInsertionEffect,
	empalEffect,
	empalGentongEffect,
	genjringActionState,
	grageId,
	grageRef,
	jamblangDeferredValue,
	jawaState,
	kanomanMemo,
	kasepuhanCallback,
	kejawananDebugValue,
	lengkoState,
	megamendungRef,
	muludanImperativeHandle,
	plumbonSyncExternalStore,
	rebonId,
	segaLengkoState,
	sintrenTransition,
	sunanContext,
	sundaState,
	tahuGejrotOptimistic,
	tajugLayoutEffect,
	tarlingReducer,
	tarlingRef,
	topengEffect,
} from "./hooks/index";

// HTTP - PanturaFetch
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
export {
	createRaktaHttp,
	HttpNetworkError,
	HttpResponseError,
	HttpTimeoutError,
	RaktaHttpClient,
} from "./http/index";

// Kernel
export type {
	PipelinePhase,
	PipelineTask,
	RaktaEnvironment,
	RaktaEnvironmentName,
	RaktaFeatureRegistration,
	RaktaKernel,
	RaktaKernelOptions,
	RaktaKernelSnapshot,
	RaktaLifecycleHook,
	RaktaModuleLoader,
	RaktaModuleLoaderOptions,
	RaktaModuleRecord,
	RaktaPipeline,
	RaktaPlugin,
	RaktaPluginContext,
	RaktaServiceContainer,
	RaktaServiceFactory,
	RaktaServiceKey,
	RaktaServiceRegistration,
	StartupPipelineResult,
} from "./kernel/index";
export {
	createModuleLoader,
	createRaktaEnvironment,
	createRaktaKernel,
	createServiceContainer,
	createStartupPipeline,
} from "./kernel/index";

// Layout
export type {
	RaktaLayoutEntry,
	RaktaLayoutFile,
	RaktaLayoutKind,
	RaktaLayoutManifest,
	ResolvedLayoutChain,
} from "./layout/index";
export {
	createLayoutManifest,
	isSpecialLayout,
	matchLayouts,
	resolveLayoutChain,
} from "./layout/index";

// Middleware
export type {
	MiddlewareComposer,
	NamedMiddleware,
	RaktaMiddleware,
	RaktaMiddlewareContext,
	RaktaMiddlewareNext,
	RaktaMiddlewareResult,
	RaktaMiddlewareScope,
	RaktaMiddlewareStack,
	RaktaMiddlewareStackOptions,
	RaktaRewriteResult,
} from "./middleware/index";
export {
	abort,
	after,
	before,
	compose,
	createMiddlewareComposer,
	createMiddlewareStack,
	defineMiddleware,
	redirect,
	rewrite,
	routeMiddleware,
} from "./middleware/index";

// Motion - IndonesiaMotion (page transitions, interactions, typography)
export {
	useCursorFollower,
	useDrag,
	useMagnetic,
	useParallax,
	useSpotlight,
	useTilt,
} from "./motion/interactions";
export {
	createMotionTimeline,
	definePageTransition,
	defineSharedElement,
	MOTION_PRESETS,
	usePageTransition,
	useSharedElement,
} from "./motion/transitions";
export type {
	IndonesiaTransitionConfig,
	MotionPreset,
	MotionTarget,
	PageTransitionHooks,
	SharedElementConfig,
	TransitionPhase,
} from "./motion/types";
export {
	animateText,
	splitText,
	useKineticText,
} from "./motion/typography";

// Operations
export type {
	CookieOptions,
	RaktaCronTask,
	RaktaEvent,
	RaktaJob,
	RaktaQueuedJob,
	RaktaRequestContext,
	ServerActionResult,
} from "./ops/index";
export {
	createRequestContext,
	createServerActionHandler,
	// server actions
	defineServerAction,
	deleteCookie,
	getCookie,
	headersToRecord,
	jsonResponse,
	// headers
	mergeHeaders,
	// cookies
	parseCookies,
	RaktaEventBus,
	RaktaQueue,
	redirectResponse,
	runCronTask,
	serializeCookie,
	setCookie,
} from "./ops/index";

// Performance
export type {
	RaktaBenchmarkKind,
	RaktaBenchmarkReport,
	RaktaBenchmarkSample,
	RaktaBuildCacheEntry,
	RaktaBundleSizeReport,
	RaktaIncrementalBuildPlan,
	RaktaMemorySnapshot,
	RaktaPerformanceSuite,
} from "./performance/index";
export {
	benchmark,
	captureMemorySnapshot,
	createBenchmarkReport,
	createBuildCache,
	createBundleSizeReport,
	createIncrementalBuildPlan,
	createPerformanceSuite,
	RaktaBuildCache,
} from "./performance/index";

// Plugin
export type {
	RaktaOfficialPlugin,
	RaktaPluginCapability,
	RaktaPluginManifest,
	RaktaPluginTemplate,
} from "./plugin/index";
export {
	createOfficialPlugins,
	createPluginRegistry,
	createPluginTemplate,
	RaktaPluginRegistry,
} from "./plugin/index";

// PWA - ShrimpHarbor
export type {
	CacheStrategyOptions,
	ManifestDisplayMode,
	ManifestIcon,
	ManifestOptions,
	ServiceWorkerOptions,
} from "./pwa/index";
export {
	buildCacheName,
	createManifestHandler,
	generateManifest as generatePwaManifest,
	generateManifestJson,
	generateServiceWorkerSource,
	resolvePrecacheList,
} from "./pwa/index";

// Render
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

// Router
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

// RPC
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
export {
	createRaktaClient,
	createRaktaRouter,
	createRpcHandler,
	ProcedureBuilder,
	publicProcedure,
	RaktaRpcError,
} from "./rpc/index";
export type { RaktaServerRuntimeOptions } from "./runtime/server";
// Runtime - Production server handler
export {
	createRaktaRequestHandler,
	startProductionServer,
} from "./runtime/server";
// Scene - MegaScape (optional 3D layer, requires three as peer dep)
export { clearAssetCache, loadGLTF, loadTexture } from "./scene/loader";
export {
	createMegaScape,
	detectDeviceQuality,
	useMegaScapeScene,
	useScrollScene,
} from "./scene/scene";
export type {
	JatiCameraConfig,
	MegaScapeConfig,
	QualityPreset,
	RenderMode as SceneRenderMode,
	SceneAdapter,
	SceneDiagnostics,
	ScrollSceneConfig,
	TrusmiMaterialConfig,
} from "./scene/types";
// Schema
export type {
	Infer,
	InferShape,
	ParseFailure,
	ParseResult,
	ParseSuccess,
	ShapeRecord,
	ValidationError,
} from "./schema/index";
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
// Security
export type {
	CspDirectives,
	RateLimitState,
	SecretRecord,
	SecureHeadersOptions,
} from "./security/index";
export {
	buildCsp,
	createCsrfToken,
	createSecureHeaders,
	decryptCookieValue,
	defaultCsp,
	encryptCookieValue,
	generateCspNonce,
	RateLimiter,
	SecretManager,
	verifyCsrfToken,
} from "./security/index";
// SEO
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
// SPA Engine
export type {
	SpaMode,
	SpaRouteGuardContext,
	SpaRouteGuardHandler,
	SpaRouterConfig,
	SpaRouterState,
} from "./spa/spa";
export {
	createSpaConfig,
	ScrollRestoration,
	SpaErrorBoundary,
	useNavigation,
	useRouteGuard,
} from "./spa/spa";
// Store
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
export { createRaktaStore } from "./store/index";
// Testing
export type {
	ComponentTestOptions,
	E2EClient,
	E2EResponse,
	RaktaCoverageReport,
	RaktaMockRoute,
	RaktaTestCase,
	RaktaTestKind,
	RaktaTestResult,
	RenderedComponent,
} from "./testing/index";
export {
	createCoverageReport,
	createE2EClient,
	createMockServer,
	createSnapshot,
	expectTestId,
	expectText,
	renderComponent,
	runRaktaTests,
} from "./testing/index";

// Tide - NorthCoastFlow
export type {
	TideAdapter,
	TideAdapterConfig,
	TideAdapterKind,
	TideRender,
	TideRenderStrategyResult,
	TideResponseBlueprint,
	TideRuntimeContext,
} from "./tide/index";
export {
	buildErrorResponse,
	buildHtmlResponse,
	buildJsonResponse,
	buildTextResponse,
	createBunAdapter,
	createRuntimeContext,
} from "./tide/index";
// Vector - TrusmiVector (SVG state machine, mascot, image zoom)
export { useImageZoom, useTrusmiGallery } from "./vector/imageExperience";
export {
	createStateMachine,
	SHRIMP_MASCOT_STATES,
	useMascot,
	useTrusmiVector,
} from "./vector/stateMachine";
export type {
	MascotState,
	StateMachineConfig,
	StateMachineTransition,
	TrusmiVectorConfig,
	VectorAnimationState,
} from "./vector/types";
