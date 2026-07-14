import "react";

declare module "*.css";
declare module "*.scss";
declare module "*.sass";

type RaktaClickAttributes = Omit<
	import("react").AnchorHTMLAttributes<HTMLElement>,
	"href"
> & {
	readonly to: string;
};

declare module "react" {
	namespace JSX {
		interface IntrinsicElements {
			click: RaktaClickAttributes;
		}
	}
}

declare global {
	const useCallback: typeof import("react").useCallback;
	const useEffect: typeof import("react").useEffect;
	const useRef: typeof import("react").useRef;
	const useState: typeof import("react").useState;
}
