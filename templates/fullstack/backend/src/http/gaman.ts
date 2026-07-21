import type { GamanContext } from "gaman";

export function requestFromGamanContext(context: GamanContext): Request {
	if (context.req instanceof Request) {
		return context.req;
	}

	if (context.request instanceof Request) {
		return context.request;
	}

	const pathname = context.path ?? context.url ?? "/";
	const requestUrl = pathname.startsWith("http")
		? pathname
		: `http://localhost${pathname}`;

	return new Request(requestUrl, {
		method: context.method ?? "GET",
	});
}

export async function sendGamanResponse(
	context: GamanContext,
	response: Response,
): Promise<unknown> {
	response.headers.forEach((value, key) => {
		context.setHeader(key, value);
	});

	context.status(response.status);

	const contentType = response.headers.get("content-type") ?? "";

	if (contentType.includes("application/json")) {
		return context.send(await response.json());
	}

	return context.send(await response.text());
}
