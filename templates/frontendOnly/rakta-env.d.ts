import "react";

declare module "*.css";
declare module "*.scss";
declare module "*.sass";

// Rakta.js built-in anchor component — use <click to="/path"> instead of <a href>
type RaktaClickAttributes = Omit<
	import("react").AnchorHTMLAttributes<HTMLElement>,
	"href"
> & {
	readonly to: string;
};

// Rakta.js built-in image component — use <photo path="..."> instead of <img>
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

// Rakta.js auto-imported React hooks — no explicit import needed in component files
declare global {
	type AestheticUnit = "LENIS-MODERN" | "RETRO-CYBER" | "NEO-BRUTALIST";
	type ReactNode = import("react").ReactNode;

	const useCallback: typeof import("react").useCallback;
	const useEffect: typeof import("react").useEffect;
	const useMemo: typeof import("react").useMemo;
	const useRef: typeof import("react").useRef;
	const useState: typeof import("react").useState;

	const motion: typeof import("motion/react").motion;

	const ArrowRight: import("react").ComponentType<Record<string, unknown>>;
	const Book: import("react").ComponentType<Record<string, unknown>>;
	const Check: import("react").ComponentType<Record<string, unknown>>;
	const CheckCircle2: import("react").ComponentType<Record<string, unknown>>;
	const Cloud: import("react").ComponentType<Record<string, unknown>>;
	const Code: import("react").ComponentType<Record<string, unknown>>;
	const Copy: import("react").ComponentType<Record<string, unknown>>;
	const Cpu: import("react").ComponentType<Record<string, unknown>>;
	const Github: import("react").ComponentType<Record<string, unknown>>;
	const Info: import("react").ComponentType<Record<string, unknown>>;
	const Play: import("react").ComponentType<Record<string, unknown>>;
	const RotateCcw: import("react").ComponentType<Record<string, unknown>>;
	const Search: import("react").ComponentType<Record<string, unknown>>;
	const Server: import("react").ComponentType<Record<string, unknown>>;
	const Terminal: import("react").ComponentType<Record<string, unknown>>;
	const Volume2: import("react").ComponentType<Record<string, unknown>>;
	const VolumeX: import("react").ComponentType<Record<string, unknown>>;
	const X: import("react").ComponentType<Record<string, unknown>>;

	const ComponentsModal: import("react").ComponentType<Record<string, unknown>>;
	const CoralObstacle: import("react").ComponentType<Record<string, unknown>>;
	const DeployModal: import("react").ComponentType<Record<string, unknown>>;
	const DocsModal: import("react").ComponentType<Record<string, unknown>>;
	const ShrimpCharacter: import("react").ComponentType<Record<string, unknown>>;

	const getMuteState: () => boolean;
	const playGameOverSound: () => void;
	const playJumpSound: () => void;
	const playScoreSound: () => void;
	const setMute: (muted: boolean) => void;
}
