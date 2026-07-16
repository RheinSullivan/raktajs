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

// Rakta.js built-in image component — use <photo src="..."> instead of <img>
type RaktaPhotoAttributes = Omit<
	import("react").ImgHTMLAttributes<HTMLImageElement>,
	"src"
> & {
	readonly src: string;
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
	const useCallback: typeof import("react").useCallback;
	const useEffect: typeof import("react").useEffect;
	const useMemo: typeof import("react").useMemo;
	const useRef: typeof import("react").useRef;
	const useState: typeof import("react").useState;
}

