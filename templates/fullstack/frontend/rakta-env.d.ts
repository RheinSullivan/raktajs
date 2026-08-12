import "react";

declare module "*.css";
declare module "*.scss";
declare module "*.sass";

declare module "raktajs/seo" {
	export interface MetadataAuthor {
		name: string;
		url?: string;
	}
	export interface OpenGraphImage {
		url: string;
		width?: number;
		height?: number;
		alt?: string;
		type?: string;
	}
	export interface OpenGraph {
		type?: "website" | "article" | "book" | "profile";
		title?: string;
		description?: string;
		url?: string;
		siteName?: string;
		images?: OpenGraphImage[];
		locale?: string;
	}
	export interface TwitterCard {
		card?: "summary" | "summary_large_image" | "app" | "player";
		site?: string;
		creator?: string;
		title?: string;
		description?: string;
		image?: string;
		imageAlt?: string;
	}
	export interface RobotsGoogleBot {
		index?: boolean;
		follow?: boolean;
		noimageindex?: boolean;
		maxVideoPreview?: number;
		maxImagePreview?: "none" | "standard" | "large";
		maxSnippet?: number;
	}
	export interface Robots {
		index?: boolean;
		follow?: boolean;
		nocache?: boolean;
		googleBot?: RobotsGoogleBot;
	}
	export interface AlternateLinks {
		canonical?: string;
		languages?: Record<string, string>;
	}
	export interface MetadataIcons {
		icon?: string | { url: string; sizes?: string; type?: string }[];
		shortcut?: string;
		apple?: string | { url: string; sizes?: string }[];
	}
	export type TitleMetadata =
		| string
		| { default: string; template?: string; absolute?: string };
	export interface FormatDetection {
		email?: boolean;
		address?: boolean;
		telephone?: boolean;
	}
	export interface JsonLdObject {
		readonly [key: string]:
			| string
			| number
			| boolean
			| JsonLdObject
			| readonly (string | number | boolean | JsonLdObject)[];
	}
	export interface JsonLd extends JsonLdObject {
		"@context": string;
		"@graph"?: JsonLdObject[];
		"@type"?: string;
	}
	export interface Metadata {
		title?: TitleMetadata;
		description?: string;
		keywords?: string | string[];
		authors?: MetadataAuthor[];
		creator?: string;
		publisher?: string;
		applicationName?: string;
		themeColor?: string;
		colorScheme?: "light" | "dark" | "light dark" | "dark light";
		viewport?: string;
		robots?: string | Robots;
		canonical?: string;
		alternates?: AlternateLinks;
		openGraph?: OpenGraph;
		twitter?: TwitterCard;
		jsonLd?: JsonLd | JsonLd[];
		icons?: MetadataIcons;
		manifest?: string;
		metadataBase?: URL | string;
		formatDetection?: FormatDetection;
		other?: Record<string, string | string[]>;
	}
	export function RaktaHead(props: {
		metadata: Metadata;
	}): import("react").ReactElement;
}

declare module "raktajs/components" {
	export type ToastType = "info" | "success" | "warning" | "error";
	export interface ToastItem {
		id: string;
		message: import("react").ReactNode;
		title?: string;
		type: ToastType;
		duration?: number;
	}
	export function RaktaToast(props: {
		readonly position?: "top-right" | "top-center" | "bottom-right";
	}): import("react").ReactElement | null;
	export const Toaster: typeof RaktaToast;
	export type AlertType = "info" | "success" | "warning" | "error";
	export interface RaktaAlertProps {
		readonly type?: AlertType;
		readonly title?: string;
		readonly children: import("react").ReactNode;
		readonly onClose?: () => void;
		readonly className?: string;
		readonly style?: import("react").CSSProperties;
	}
	export function RaktaAlert(
		props: RaktaAlertProps,
	): import("react").ReactElement;
	export function Alert(props: RaktaAlertProps): import("react").ReactElement;
	export function Pantura(
		props: Record<string, unknown>,
	): import("react").ReactElement;
	export function Reborns(
		props: Record<string, unknown>,
	): import("react").ReactElement;
	export function usePantura(): (
		id: string,
		options?: Record<string, unknown>,
	) => void;
	export const toast: {
		info: (
			message: import("react").ReactNode,
			options?: { title?: string; duration?: number },
		) => string;
		success: (
			message: import("react").ReactNode,
			options?: { title?: string; duration?: number },
		) => string;
		warning: (
			message: import("react").ReactNode,
			options?: { title?: string; duration?: number },
		) => string;
		error: (
			message: import("react").ReactNode,
			options?: { title?: string; duration?: number },
		) => string;
		remove: (id: string) => void;
		clear: () => void;
	};
	export function useToast(): {
		toasts: readonly ToastItem[];
		toast: typeof toast;
		removeToast: (id: string) => void;
		clearToasts: () => void;
	};
}

// Rakta.js built-in anchor component - use <click to="/path"> instead of <a href>
type RaktaClickAttributes = Omit<
	import("react").AnchorHTMLAttributes<HTMLElement>,
	"href"
> & {
	readonly to: string;
};

// Rakta.js built-in image component - use <photo path="..."> instead of <img>
type RaktaPhotoAttributes = Omit<
	import("react").ImgHTMLAttributes<HTMLImageElement>,
	"src"
> & {
	readonly path: string;
};

declare module "react" {
	namespace JSX {
		interface IntrinsicElements {
			// Rakta.js SPA anchor: compiles to <a> with client-side routing
			click: RaktaClickAttributes;
			// Rakta.js image: compiles to <img> with built-in lazy loading & optimization
			photo: RaktaPhotoAttributes;
			// Rakta.js smooth scroll trigger: navigates to <reborns id="">
			pantura: Omit<
				import("react").AnchorHTMLAttributes<HTMLElement>,
				"href"
			> & {
				readonly to: string;
				readonly offset?: number;
				readonly duration?: number;
				readonly easing?: string;
				readonly updateHash?: boolean;
				readonly activeClassName?: string;
			};
			// Rakta.js scroll target marker
			reborns: import("react").HTMLAttributes<HTMLElement> & {
				readonly id: string;
			};
		}
	}
}

// Rakta.js auto-imported globals - zero explicit import needed in component files
declare global {
	// ── React Global Namespace ──
	namespace React {
		type FormEvent<T = Element> = import("react").FormEvent<T>;
		type ChangeEvent<T = Element> = import("react").ChangeEvent<T>;
		type MouseEvent<T = Element> = import("react").MouseEvent<T>;
		type KeyboardEvent<T = Element> = import("react").KeyboardEvent<T>;
		type FocusEvent<T = Element> = import("react").FocusEvent<T>;
		type ReactNode = import("react").ReactNode;
		type ReactElement = import("react").ReactElement;
		type CSSProperties = import("react").CSSProperties;
	}

	// ── Core Types ──
	type AestheticUnit = "LENIS-MODERN" | "RETRO-CYBER" | "NEO-BRUTALIST";
	type ReactNode = import("react").ReactNode;
	type ReactElement = import("react").ReactElement;
	type Metadata = import("raktajs/seo").Metadata;
	type TitleMetadata = import("raktajs/seo").TitleMetadata;
	type FormatDetection = import("raktajs/seo").FormatDetection;
	type SimSpeed = "NORMAL" | "FAST" | "TURBO";
	type ObstaclePosition = "TOP" | "BOTTOM";
	type ObstacleSizeClass = "KECIL" | "SEDANG" | "BESAR";
	type UserRole = "ADMIN" | "USER" | "GUEST";
	type Gender = "MALE" | "FEMALE" | "OTHER";

	type FormEvent<T = Element> = import("react").FormEvent<T>;
	type ChangeEvent<T = Element> = import("react").ChangeEvent<T>;
	type MouseEvent<T = Element> = import("react").MouseEvent<T>;
	type KeyboardEvent<T = Element> = import("react").KeyboardEvent<T>;
	type FocusEvent<T = Element> = import("react").FocusEvent<T>;
	type CSSProperties = import("react").CSSProperties;

	interface ObstacleSize {
		height: number;
		width: number;
		sizeClass: ObstacleSizeClass;
	}

	interface GamePhysicsConfig {
		readonly gravity: number;
		readonly jumpVelocity: number;
		readonly startVelocity: number;
		readonly playerStartY: number;
		readonly playerMinY: number;
		readonly playerMaxY: number;
		readonly playerBounceVelocity: number;
	}

	interface ObstacleRuntimeConfig {
		readonly startX: number;
		readonly resetX: number;
		readonly baseSpeed: number;
		readonly maxSpeedMultiplier: number;
		readonly speedScoreInterval: number;
		readonly speedIncrement: number;
	}

	interface ObstacleSizeRange {
		readonly heightMin: number;
		readonly heightRange: number;
		readonly widthMin: number;
		readonly widthRange: number;
	}

	const GAME_PHYSICS: GamePhysicsConfig;
	const OBSTACLE_CONFIG: ObstacleRuntimeConfig;
	const SIM_SPEED_MULTIPLIER: Record<SimSpeed, number>;
	const OBSTACLE_SIZES: Record<ObstacleSizeClass, ObstacleSizeRange>;
	const SIZE_THRESHOLDS: { readonly small: number; readonly medium: number };
	const SHRIMP_HITBOX: {
		readonly xPercent: number;
		readonly widthPercent: number;
		readonly heightPx: number;
	};
	const HIGH_SCORE_KEY: string;
	const calculateObstacleSpeed: (
		score: number,
		simSpeedMultiplier: number,
	) => number;
	const checkCollision: (
		playerY: number,
		obstacleX: number,
		obstacleWidth: number,
		obstacleHeight: number,
		obstaclePos: ObstaclePosition,
	) => boolean;
	const getRandomObstacleSize: (_pos: ObstaclePosition) => ObstacleSize;
	const readHighScore: (key: string) => number;
	const saveHighScore: (key: string, score: number) => void;

	interface HeaderProps {
		lang: "ID" | "EN";
		onLangToggle: () => void;
		isMuted: boolean;
		onMuteToggle: () => void;
		aestheticUnit: AestheticUnit;
		onAestheticChange: (unit: AestheticUnit) => void;
		lowLatencyMode: boolean;
		onLowLatencyToggle: () => void;
	}

	interface HeroSectionProps {
		lang: "ID" | "EN";
		onOpenDocs: () => void;
		onOpenComponents: () => void;
		onOpenDeploy: () => void;
	}

	interface ShrimpRunGameProps {
		isPlaying: boolean;
		score: number;
		highScore: number;
		hasCollision: boolean;
		liveFps: number;
		playerY: number;
		obstacleX: number;
		obstaclePos: ObstaclePosition;
		obstacleHeight: number;
		obstacleWidth: number;
		obstaclePalette: number;
		obstacleVariant: number;
		obstacleScaleX: number;
		obstacleSizeClass: ObstacleSizeClass;
		simSpeed: SimSpeed;
		onSpeedChange: (speed: SimSpeed) => void;
		onStartSimulation: () => void;
		onTriggerJump: () => void;
	}

	interface ModalProps {
		isOpen: boolean;
		onClose: () => void;
	}

	interface AuthShellProps {
		eyebrow: string;
		title: string;
		description: string;
		children: ReactNode;
	}

	interface AuthResult {
		user: {
			id: string;
			firstName: string;
			lastName: string;
			name: string;
			email: string;
			role: UserRole;
			gender: Gender;
		};
		token: string;
		sessionId: string;
	}

	interface RegisterUserInput {
		firstName: string;
		lastName: string;
		email: string;
		password: string;
		role: UserRole;
		gender: Gender;
	}

	// ── React Hooks ──
	const useCallback: typeof import("react").useCallback;
	const useEffect: typeof import("react").useEffect;
	const useMemo: typeof import("react").useMemo;
	const useRef: typeof import("react").useRef;
	const useState: typeof import("react").useState;

	// ── GSAP ──
	const gsap: typeof import("gsap").default;

	// ── Rakta.js SEO ──
	const RaktaHead: typeof import("raktajs/seo").RaktaHead;

	// ── Rakta.js Components ──
	const RaktaToast: typeof import("raktajs/components").RaktaToast;
	const Toaster: typeof import("raktajs/components").Toaster;
	const RaktaAlert: typeof import("raktajs/components").RaktaAlert;
	const Alert: typeof import("raktajs/components").Alert;
	const Pantura: typeof import("raktajs/components").Pantura;
	const Reborns: typeof import("raktajs/components").Reborns;
	const usePantura: typeof import("raktajs/components").usePantura;
	const toast: typeof import("raktajs/components").toast;
	const useToast: typeof import("raktajs/components").useToast;

	// ── Icons ──
	const ArrowRight: import("react").ComponentType<Record<string, unknown>>;
	const Book: import("react").ComponentType<Record<string, unknown>>;
	const Check: import("react").ComponentType<Record<string, unknown>>;
	const CheckCircle2: import("react").ComponentType<Record<string, unknown>>;
	const Cloud: import("react").ComponentType<Record<string, unknown>>;
	const Code: import("react").ComponentType<Record<string, unknown>>;
	const Coffee: import("react").ComponentType<Record<string, unknown>>;
	const Copy: import("react").ComponentType<Record<string, unknown>>;
	const Cpu: import("react").ComponentType<Record<string, unknown>>;
	const Github: import("react").ComponentType<Record<string, unknown>>;
	const Globe: import("react").ComponentType<Record<string, unknown>>;
	const Heart: import("react").ComponentType<Record<string, unknown>>;
	const Info: import("react").ComponentType<Record<string, unknown>>;
	const Play: import("react").ComponentType<Record<string, unknown>>;
	const RotateCcw: import("react").ComponentType<Record<string, unknown>>;
	const Search: import("react").ComponentType<Record<string, unknown>>;
	const Server: import("react").ComponentType<Record<string, unknown>>;
	const Terminal: import("react").ComponentType<Record<string, unknown>>;
	const Volume2: import("react").ComponentType<Record<string, unknown>>;
	const VolumeX: import("react").ComponentType<Record<string, unknown>>;
	const X: import("react").ComponentType<Record<string, unknown>>;

	// ── Rakta.js Built-in Components ──
	const Click: typeof import("raktajs/components").Click;
	const click: typeof import("raktajs/components").Click;
	const Photo: typeof import("raktajs/components").Picture;
	const photo: typeof import("raktajs/components").Picture;
	const Picture: typeof import("raktajs/components").Picture;

	// ── Icons (react-icons/fa6 - auto-imported by Rakta.js) ──
	const FaArrowRight: import("react").ComponentType<{
		className?: string;
		style?: import("react").CSSProperties;
	}>;
	const FaArrowRotateRight: import("react").ComponentType<{
		className?: string;
		style?: import("react").CSSProperties;
	}>;
	const FaBook: import("react").ComponentType<{
		className?: string;
		style?: import("react").CSSProperties;
	}>;
	const FaCheck: import("react").ComponentType<{
		className?: string;
		style?: import("react").CSSProperties;
	}>;
	const FaCircleCheck: import("react").ComponentType<{
		className?: string;
		style?: import("react").CSSProperties;
	}>;
	const FaCloud: import("react").ComponentType<{
		className?: string;
		style?: import("react").CSSProperties;
	}>;
	const FaCode: import("react").ComponentType<{
		className?: string;
		style?: import("react").CSSProperties;
	}>;
	const FaCopy: import("react").ComponentType<{
		className?: string;
		style?: import("react").CSSProperties;
	}>;
	const FaHandHoldingHeart: import("react").ComponentType<{
		className?: string;
		style?: import("react").CSSProperties;
	}>;
	const FaHeart: import("react").ComponentType<{
		className?: string;
		style?: import("react").CSSProperties;
	}>;
	const FaMagnifyingGlass: import("react").ComponentType<{
		className?: string;
		style?: import("react").CSSProperties;
	}>;
	const FaMicrochip: import("react").ComponentType<{
		className?: string;
		style?: import("react").CSSProperties;
	}>;
	const FaPlay: import("react").ComponentType<{
		className?: string;
		style?: import("react").CSSProperties;
	}>;
	const FaRibbon: import("react").ComponentType<{
		className?: string;
		style?: import("react").CSSProperties;
	}>;
	const FaXmark: import("react").ComponentType<{
		className?: string;
		style?: import("react").CSSProperties;
	}>;

	// ── App Components (auto-resolved from app/ directory) ──
	const BackgroundFish: import("react").ComponentType<Record<string, unknown>>;
	const BubbleLayer: import("react").ComponentType<Record<string, unknown>>;
	const ComponentsModal: import("react").ComponentType<ModalProps>;
	const CoralObstacle: import("react").ComponentType<Record<string, unknown>>;
	const DeployModal: import("react").ComponentType<ModalProps>;
	const DocsModal: import("react").ComponentType<ModalProps>;
	const DonationSection: import("react").ComponentType<Record<string, unknown>>;
	const FeatureGrid: import("react").ComponentType<Record<string, unknown>>;
	const Footer: import("react").ComponentType<Record<string, unknown>>;
	const Header: import("react").ComponentType<HeaderProps>;
	const HeroSection: import("react").ComponentType<HeroSectionProps>;
	const PackageStatsStrip: import("react").ComponentType<{
		readonly lang: "ID" | "EN";
	}>;
	const SeaweedGrass: import("react").ComponentType<Record<string, unknown>>;
	const ShrimpCharacter: import("react").ComponentType<Record<string, unknown>>;
	const ShrimpRunGame: import("react").ComponentType<ShrimpRunGameProps>;
	const AuthShell: import("react").ComponentType<AuthShellProps>;

	// ── Custom Hooks ──
	const useShrimpRun: () => {
		isPlaying: boolean;
		score: number;
		highScore: number;
		hasCollision: boolean;
		liveFps: number;
		simSpeed: SimSpeed;
		setSimSpeed: (speed: SimSpeed) => void;
		playerY: number;
		obstacleX: number;
		obstaclePos: ObstaclePosition;
		obstacleHeight: number;
		obstacleWidth: number;
		obstaclePalette: number;
		obstacleVariant: number;
		obstacleScaleX: number;
		obstacleSizeClass: ObstacleSizeClass;
		startSimulation: () => void;
		triggerJump: () => void;
	};

	// ── Auth Utilities ──
	const loginUser: (email: string, password: string) => Promise<AuthResult>;
	const registerUser: (input: RegisterUserInput) => Promise<AuthResult>;
	const requestPasswordOtp: (
		email: string,
	) => Promise<{ otp: string; expiresAt: number }>;
	const resetPassword: (
		email: string,
		otp: string,
		password: string,
	) => Promise<unknown>;
	const resetPasswordWithOtp: (input: {
		email: string;
		otp: string;
		newPassword: string;
	}) => Promise<unknown>;
	const apiGet: <TData>(path: string) => Promise<TData>;
	const API_URL: string;

	// ── Audio Helpers ──
	const getMuteState: () => boolean;
	const playGameOverSound: () => void;
	const playJumpSound: () => void;
	const playScoreSound: () => void;
	const setMute: (muted: boolean) => void;

	// ── App Lib Data (auto-imported from app/lib/) ──
	// fishData
	interface Fish {
		id: number;
		size: "small" | "medium";
		speed: number;
		startY: number;
		delay: number;
		direction: "left" | "right";
	}
	const FISH_CONFIG: readonly Fish[];

	// componentData
	type ComponentId = "button" | "badge" | "switch" | "slider" | "input";
	const COMPONENT_IDS: readonly ComponentId[];
	const COMPONENT_METADATA: Record<
		ComponentId,
		{ name: string; description: string; code: string }
	>;

	// deployData
	type DeployLogType = "system" | "info" | "success";
	interface DeployLog {
		readonly text: string;
		readonly type: DeployLogType;
	}
	const DEPLOY_LOGS: readonly DeployLog[];
	const getLogTextClass: (type: DeployLogType) => string;

	// docsData
	interface Article {
		id: string;
		title: string;
		category: string;
		content: string;
	}
	const ARTICLES: Article[];

	// featureData
	interface RaktaFeature {
		id: string;
		title: string;
		desc: string | { id: string; en: string };
		code: string;
	}
	const raktaFeatures: readonly RaktaFeature[];

	// packageStats
	interface PackageStats {
		readonly dependencies: number;
		readonly dependencyNames: readonly string[];
		readonly dependents: number | null;
		readonly version?: string;
		readonly updatedAt?: string;
	}
	const fetchPackageStats: () => Promise<PackageStats>;
	const getCachedPackageStats: () => PackageStats | null;
	const parseDependentsCount: (responseData: unknown) => number | null;
	const parseRuntimeDependencies: (
		metadata: unknown,
	) => Pick<
		PackageStats,
		"dependencies" | "dependencyNames" | "updatedAt" | "version"
	>;
}
