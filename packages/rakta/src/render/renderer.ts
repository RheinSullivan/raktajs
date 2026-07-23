import { isRoadmapMode } from "./modes";
import type {
	RenderContext,
	RenderFailure,
	RenderMode,
	RenderResult,
	RenderSuccess,
} from "./types";

export interface RendererOptions {
	readonly appName: string;
	readonly title?: string | undefined;
	readonly description?: string | undefined;
	readonly faviconPath?: string | undefined;
	readonly scriptPath: string;
	readonly cssPath: string;
	readonly lang: string;
}

function buildHtmlShell(options: RendererOptions): string {
	const title = options.title ?? options.appName;
	const faviconPath = options.faviconPath ?? "/favicon.ico";
	const faviconHref = faviconPath.includes("?")
		? faviconPath
		: `${faviconPath}?v=rakta`;
	const descriptionMeta =
		options.description !== undefined
			? `<meta name="description" content="${options.description}" />`
			: "";

	return `
  <!DOCTYPE html>
    <html lang="${options.lang}">
        <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>${title}</title>
            ${descriptionMeta}
            <link rel="icon" href="${faviconHref}" sizes="any" type="image/x-icon" />
            <link rel="shortcut icon" href="${faviconHref}" type="image/x-icon" />
            <link rel="apple-touch-icon" href="${faviconHref}" />
            <link rel="stylesheet" href="${options.cssPath}" />
        </head>
        <body>
            <div id="rakta-root"></div>
            <script type="module" src="${options.scriptPath}"></script>
        </body>
    </html>`;
}

function makeSuccess(
	html: string,
	mode: RenderMode,
	renderMs: number,
	httpStatus: number = 200,
	fromCache: boolean = false,
): RenderSuccess {
	return {
		kind: "success",
		html,
		mode,
		httpStatus,
		responseHeaders: { "Content-Type": "text/html; charset=utf-8" },
		fromCache,
		renderMs,
	};
}

function makeFailure(
	reason: string,
	mode: RenderMode,
	httpStatus: number = 500,
): RenderFailure {
	return { kind: "failure", reason, mode, httpStatus };
}

/**
 * Render a page using the resolved mode from the context.
 * Roadmap modes (ssr, ssg, csg) fall back to a CSR shell in v0.1.0.
 */
export async function render(
	context: RenderContext,
	options: RendererOptions,
): Promise<RenderResult> {
	const startMs = Date.now();

	// Roadmap modes: fall back to CSR shell with a warning
	if (isRoadmapMode(context.mode)) {
		console.warn(
			[
				`[Rakta.js] Render mode "${context.mode}" is a roadmap feature (v1.0.2).`,
				`Falling back to CSR for: ${context.routePath}`,
			].join(" "),
		);
		return makeSuccess(buildHtmlShell(options), "csr", Date.now() - startMs);
	}

	switch (context.mode) {
		case "csr":
		case "spa":
			return makeSuccess(
				buildHtmlShell(options),
				context.mode,
				Date.now() - startMs,
			);

		case "hybrid":
			// Hybrid resolution happens upstream in Tide. If it reaches the renderer
			// as hybrid, the route had no specific override - fall back to CSR.
			return makeSuccess(buildHtmlShell(options), "csr", Date.now() - startMs);

		case "ssr":
		case "ssg":
		case "csg":
			// These are already caught by isRoadmapMode above, but TypeScript
			// requires an exhaustive switch for the RenderMode union.
			return makeFailure(
				`Render mode "${context.mode}" is not yet implemented.`,
				context.mode,
				501,
			);
	}
}

export function renderNotFound(options: RendererOptions): RenderSuccess {
	return makeSuccess(buildHtmlShell(options), "csr", 0, 404);
}

export function renderServerError(
	reason: string,
	mode: RenderMode,
): RenderFailure {
	return makeFailure(reason, mode, 500);
}
