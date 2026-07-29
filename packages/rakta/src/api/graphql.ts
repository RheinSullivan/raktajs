// RaktaAPI - GraphQL adapter
// Lightweight bridge to graphql-js. The `graphql` package is a peer dep.
// Run: bun add graphql

export interface GraphQLSchemaDefinition {
	readonly typeDefs: string;
	readonly resolvers: Record<string, Record<string, unknown>>;
}

export interface GraphQLHandlerOptions {
	/** Enable GraphQL introspection. Default: true in development, false in production. */
	readonly introspection?: boolean;
	/** Custom error handler. */
	readonly onError?: (error: unknown) => void;
}

/**
 * Returns true if introspection should be enabled in the current environment.
 */
export function introspectionEnabled(
	nodeEnv: string | undefined = process.env.NODE_ENV,
): boolean {
	return nodeEnv !== "production";
}

type GraphQLModule = {
	buildSchema(typeDefs: string): unknown;
	graphql(options: {
		schema: unknown;
		source: string;
		rootValue?: unknown;
		variableValues?: Record<string, unknown>;
		operationName?: string;
	}): Promise<unknown>;
};

/**
 * Create a GraphQL HTTP handler from schema type defs and resolvers.
 * Requires `graphql` package as a peer dependency: `bun add graphql`
 */
export function createGraphQLHandler(
	schemaDefinition: GraphQLSchemaDefinition,
	options: GraphQLHandlerOptions = {},
): (request: Request) => Promise<Response> {
	return async (request: Request): Promise<Response> => {
		let graphqlModule: GraphQLModule;

		try {
			// biome-ignore lint/suspicious/noExplicitAny: graphql is a peer dependency not in devDeps
			graphqlModule = (await import("graphql" as string)) as any;
		} catch {
			return Response.json(
				{
					errors: [
						{
							message:
								"[Rakta] graphql package not installed. Run: bun add graphql",
						},
					],
				},
				{ status: 500 },
			);
		}

		let builtSchema: unknown;
		try {
			builtSchema = graphqlModule.buildSchema(schemaDefinition.typeDefs);
		} catch (schemaError) {
			options.onError?.(schemaError);
			return Response.json(
				{
					errors: [
						{
							message:
								schemaError instanceof Error
									? schemaError.message
									: "Schema build failed.",
						},
					],
				},
				{ status: 500 },
			);
		}

		let queryString: string;
		let variables: Record<string, unknown> | undefined;
		let operationName: string | undefined;

		if (request.method === "GET") {
			const url = new URL(request.url);
			queryString = url.searchParams.get("query") ?? "";
			const variablesParam = url.searchParams.get("variables");
			if (variablesParam) {
				try {
					variables = JSON.parse(variablesParam) as Record<string, unknown>;
				} catch {
					// ignore malformed variables
				}
			}
		} else if (request.method === "POST") {
			let body: {
				query?: string;
				variables?: Record<string, unknown>;
				operationName?: string;
			};
			try {
				body = (await request.json()) as typeof body;
			} catch {
				return Response.json(
					{ errors: [{ message: "Invalid JSON body." }] },
					{ status: 400 },
				);
			}
			queryString = body.query ?? "";
			variables = body.variables;
			operationName = body.operationName;
		} else {
			return Response.json(
				{ errors: [{ message: "Method not allowed." }] },
				{ status: 405 },
			);
		}

		if (!queryString.trim()) {
			return Response.json(
				{ errors: [{ message: "No query provided." }] },
				{ status: 400 },
			);
		}

		const result = await graphqlModule.graphql({
			schema: builtSchema,
			source: queryString,
			rootValue: schemaDefinition.resolvers.Query,
			...(variables !== undefined ? { variableValues: variables } : {}),
			...(operationName !== undefined ? { operationName } : {}),
		});

		return Response.json(result);
	};
}
