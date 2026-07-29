import { describe, expect, test } from "bun:test";
import {
	BadRequestResponse,
	ForbiddenResponse,
	generateOpenApiSpec,
	introspectionEnabled,
	jsonError,
	jsonSuccess,
	NotFoundResponse,
	paginatedResponse,
	parsePagination,
	parseQueryString,
	parseRouteParams,
	UnauthorizedResponse,
} from "./index";

describe("Rakta API helpers", () => {
	test("parses route params from pattern and pathname", () => {
		const params = parseRouteParams(
			"/users/:userId/posts/:postId",
			"/users/42/posts/7",
		);
		expect(params.userId).toBe("42");
		expect(params.postId).toBe("7");
	});

	test("parses query string including multi-value keys", () => {
		const result = parseQueryString("?name=Rhein&tag=ts&tag=react");
		expect(result.name).toBe("Rhein");
		expect(result.tag).toEqual(["ts", "react"]);
	});

	test("jsonSuccess returns 200 with ok:true", async () => {
		const response = jsonSuccess({ user: "test" });
		expect(response.status).toBe(200);
		const body = (await response.json()) as { ok: boolean };
		expect(body.ok).toBe(true);
	});

	test("jsonError returns structured error response", async () => {
		const response = jsonError("Not found", 404, "NOT_FOUND");
		expect(response.status).toBe(404);
		const body = (await response.json()) as {
			ok: boolean;
			error: string;
			code: string;
		};
		expect(body.ok).toBe(false);
		expect(body.code).toBe("NOT_FOUND");
	});

	test("NotFoundResponse, BadRequest, Unauthorized, Forbidden shortcuts", () => {
		expect(NotFoundResponse().status).toBe(404);
		expect(BadRequestResponse().status).toBe(400);
		expect(UnauthorizedResponse().status).toBe(401);
		expect(ForbiddenResponse().status).toBe(403);
	});

	test("paginatedResponse returns correct pagination metadata", async () => {
		const response = paginatedResponse(["a", "b", "c"], 10, 1, 3);
		const body = (await response.json()) as {
			ok: boolean;
			data: {
				totalPages: number;
				hasNext: boolean;
				hasPrev: boolean;
				items: string[];
			};
		};
		expect(body.ok).toBe(true);
		expect(body.data.totalPages).toBe(4);
		expect(body.data.hasNext).toBe(true);
		expect(body.data.hasPrev).toBe(false);
		expect(body.data.items).toHaveLength(3);
	});

	test("parsePagination extracts page and pageSize from request URL", () => {
		const request = new Request("http://localhost/api?page=2&pageSize=10");
		const pagination = parsePagination(request);
		expect(pagination.page).toBe(2);
		expect(pagination.pageSize).toBe(10);
		expect(pagination.offset).toBe(10);
	});

	test("generateOpenApiSpec builds valid 3.1 spec", () => {
		const spec = generateOpenApiSpec(
			[
				{
					method: "GET",
					path: "/api/users/:userId",
					operation: {
						summary: "Get user",
						responses: { "200": { description: "User found" } },
					},
				},
			],
			{ title: "Test API", version: "1.0.0" },
		);

		expect(spec.openapi).toBe("3.1.0");
		expect(spec.info.title).toBe("Test API");
		expect(spec.paths["/api/users/{userId}"]?.get?.summary).toBe("Get user");
	});

	test("introspectionEnabled returns false in production", () => {
		expect(introspectionEnabled("production")).toBe(false);
		expect(introspectionEnabled("development")).toBe(true);
		expect(introspectionEnabled(undefined)).toBe(true);
	});
});
