export type RouteKind =
	| "page"
	| "layout"
	| "loading"
	| "notFound"
	| "error"
	| "api";

export interface RouteSegment {
	raw: string;
	isDynamic: boolean;
	paramName: string;
}

export interface RouteManifestEntry {
	filePath: string;
	urlPattern: string;
	kind: RouteKind;
	segments: RouteSegment[];
	isDynamic: boolean;
	paramNames: string[];
}

export interface RouteManifest {
	version: "1";
	generatedAt: string;
	routes: RouteManifestEntry[];
}

export interface MatchedRoute {
	entry: RouteManifestEntry;
	params: Record<string, string>;
}

export interface RouteContext {
	params: Record<string, string>;
	searchParams: URLSearchParams;
	pathname: string;
	url: URL;
}

export interface PageProps {
	params: Record<string, string>;
	searchParams: Record<string, string>;
}

export interface LayoutProps {
	children: React.ReactNode;
	searchParams: Record<string, string>;
}

export type ApiMethod =
	| "GET"
	| "POST"
	| "PUT"
	| "PATCH"
	| "DELETE"
	| "HEAD"
	| "OPTIONS";

export type ApiRouteHandler = (
	request: Request,
	context: RouteContext,
) => Response | Promise<Response>;

export type ApiRouteModule = Partial<Record<ApiMethod, ApiRouteHandler>>;

export type GenerateMetadataFn<
	TParams extends Record<string, string> = Record<string, string>,
> = (context: {
	params: TParams;
	searchParams?: Record<string, string>;
}) =>
	| Promise<import("../seo/metadata.ts").Metadata>
	| import("../seo/metadata.ts").Metadata;
