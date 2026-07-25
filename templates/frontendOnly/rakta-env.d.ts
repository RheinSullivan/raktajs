import "react";

declare module "*.css";
declare module "*.scss";
declare module "*.sass";

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
		}
	}
}

// Rakta.js auto-imported globals — zero explicit import needed in component files
declare global {
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

	// React event/utility types — available without any import
	const React: typeof import("react");
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

	// ── React Hooks ──
	const useCallback: typeof import("react").useCallback;
	const useEffect: typeof import("react").useEffect;
	const useMemo: typeof import("react").useMemo;
	const useRef: typeof import("react").useRef;
	const useState: typeof import("react").useState;

	// ── GSAP ──
	const gsap: typeof import("gsap").default;

	// ── Rakta.js Components ──
	const RaktaToast: typeof import("raktajs/components").RaktaToast;
	const Toaster: typeof import("raktajs/components").Toaster;
	const RaktaAlert: typeof import("raktajs/components").RaktaAlert;
	const Alert: typeof import("raktajs/components").Alert;
	const Sintren: typeof import("raktajs/components").Sintren;
	const useSintren: typeof import("raktajs/components").useSintren;
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

	// ── App Components (auto-resolved from app/ directory) ──
	const ComponentsModal: import("react").ComponentType<ModalProps>;
	const CoralObstacle: import("react").ComponentType<Record<string, unknown>>;
	const DeployModal: import("react").ComponentType<ModalProps>;
	const DocsModal: import("react").ComponentType<ModalProps>;
	const ShrimpCharacter: import("react").ComponentType<Record<string, unknown>>;
	const Header: import("react").ComponentType<HeaderProps>;
	const HeroSection: import("react").ComponentType<HeroSectionProps>;
	const ShrimpRunGame: import("react").ComponentType<ShrimpRunGameProps>;
	const FeatureGrid: import("react").ComponentType<Record<string, unknown>>;
	const Footer: import("react").ComponentType<Record<string, unknown>>;

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

	// ── Audio Helpers ──
	const getMuteState: () => boolean;
	const playGameOverSound: () => void;
	const playJumpSound: () => void;
	const playScoreSound: () => void;
	const setMute: (muted: boolean) => void;
}
