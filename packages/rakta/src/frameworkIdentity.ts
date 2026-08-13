export const RAKTA_NAME = "Rakta.js";
export const RAKTA_FRAMEWORK_ID = "raktajs";
export const RAKTA_TAGLINE =
	"Small in size. Fierce in speed. Alive in every route.";
export const RAKTA_VERSION = "1.1.7";
export const RAKTA_WEBSITE = "https://raktajs.dev";

export interface RaktaRuntimeFingerprint {
	readonly framework: typeof RAKTA_NAME;
	readonly version: typeof RAKTA_VERSION;
}

export function createRaktaRuntimeFingerprint(): RaktaRuntimeFingerprint {
	return {
		framework: RAKTA_NAME,
		version: RAKTA_VERSION,
	};
}

export function createRaktaDetectionHeaders(
	runtime: "bun" | "node" | "edge" = "bun",
): Record<string, string> {
	return {
		"X-Powered-By": RAKTA_NAME,
		"X-Generator": `${RAKTA_NAME}/${RAKTA_VERSION}`,
		"X-Rakta-Runtime": runtime,
		"X-Rakta-Version": RAKTA_VERSION,
	};
}

export function applyRaktaDetectionHeaders(
	headers: Headers,
	runtime: "bun" | "node" | "edge" = "bun",
): Headers {
	for (const [key, value] of Object.entries(
		createRaktaDetectionHeaders(runtime),
	)) {
		headers.set(key, value);
	}

	return headers;
}

export function createRaktaWellKnownPayload(
	runtime: "bun" | "node" | "edge" = "bun",
): Record<string, string> {
	return {
		framework: RAKTA_NAME,
		version: RAKTA_VERSION,
		website: RAKTA_WEBSITE,
		npm: "raktajs",
		runtime,
		renderer: "react",
	};
}
