// RaktaAPI - OpenAPI 3.1 spec generation
// Build-time generation from route manifest and inline annotations.
// Zero runtime cost - generate during build, serve static JSON/YAML.

export interface OpenApiInfo {
	readonly title: string;
	readonly version: string;
	readonly description?: string;
	readonly contact?: {
		readonly name?: string;
		readonly email?: string;
		readonly url?: string;
	};
	readonly license?: {
		readonly name: string;
		readonly url?: string;
	};
}

export type OpenApiParameterLocation = "query" | "path" | "header" | "cookie";

export interface OpenApiParameter {
	readonly name: string;
	readonly in: OpenApiParameterLocation;
	readonly description?: string;
	readonly required?: boolean;
	readonly schema?: {
		readonly type: string;
		readonly format?: string;
		readonly enum?: readonly unknown[];
	};
}

export interface OpenApiResponseEntry {
	readonly description: string;
	readonly content?: Record<string, { schema: Record<string, unknown> }>;
}

export interface OpenApiOperation {
	readonly operationId?: string;
	readonly summary?: string;
	readonly description?: string;
	readonly tags?: readonly string[];
	readonly parameters?: readonly OpenApiParameter[];
	readonly requestBody?: {
		readonly required?: boolean;
		readonly content: Record<string, { schema: Record<string, unknown> }>;
	};
	readonly responses: Record<string, OpenApiResponseEntry>;
}

export interface OpenApiPathItem {
	readonly get?: OpenApiOperation;
	readonly post?: OpenApiOperation;
	readonly put?: OpenApiOperation;
	readonly patch?: OpenApiOperation;
	readonly delete?: OpenApiOperation;
}

export interface OpenApiSpec {
	readonly openapi: "3.1.0";
	readonly info: OpenApiInfo;
	readonly paths: Record<string, OpenApiPathItem>;
	readonly components?: {
		readonly schemas?: Record<string, Record<string, unknown>>;
		readonly securitySchemes?: Record<string, Record<string, unknown>>;
	};
	readonly tags?: readonly { name: string; description?: string }[];
}

/**
 * Define a single OpenAPI operation (used as inline annotation on route handlers).
 */
export function defineOpenApiOperation(
	operation: OpenApiOperation,
): OpenApiOperation {
	return operation;
}

/**
 * Generate an OpenAPI 3.1 spec object from a list of annotated routes.
 */
export function generateOpenApiSpec(
	routes: ReadonlyArray<{
		readonly method: string;
		readonly path: string;
		readonly operation: OpenApiOperation;
	}>,
	info: OpenApiInfo,
): OpenApiSpec {
	const paths: Record<string, OpenApiPathItem> = {};

	for (const route of routes) {
		const normalizedPath = route.path.replace(/:([^/]+)/g, "{$1}");
		const method = route.method.toLowerCase() as keyof OpenApiPathItem;
		const existing = paths[normalizedPath] ?? {};

		paths[normalizedPath] = {
			...existing,
			[method]: route.operation,
		};
	}

	return {
		openapi: "3.1.0",
		info,
		paths,
	};
}

/**
 * Serve a minimal Swagger UI HTML page for a given OpenAPI spec.
 * Returns a Response if the request pathname matches, undefined otherwise.
 *
 * @example
 * const swaggerResponse = serveSwaggerUI(spec, "/api/docs");
 * if (swaggerResponse) return swaggerResponse;
 */
export function serveSwaggerUI(
	spec: OpenApiSpec,
	docsPath = "/api/docs",
): (request: Request) => Response | undefined {
	const specJson = JSON.stringify(spec, null, 2);

	const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>${spec.info.title} - API Docs</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css"/>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script>
    SwaggerUIBundle({
      spec: ${specJson},
      dom_id: '#swagger-ui',
      deepLinking: true,
      presets: [SwaggerUIBundle.presets.apis, SwaggerUIBundle.SwaggerUIStandalonePreset],
      layout: "StandaloneLayout"
    });
  </script>
</body>
</html>`;

	return (request: Request): Response | undefined => {
		const url = new URL(request.url);
		if (url.pathname !== docsPath) return undefined;
		return new Response(html, {
			headers: { "Content-Type": "text/html; charset=utf-8" },
		});
	};
}
