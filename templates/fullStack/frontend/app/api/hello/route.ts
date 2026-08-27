export function GET(request: Request): Response {
	const requestUrl = new URL(request.url);

	return Response.json({
		success: true,
		message: "Hello from Rakta frontend API route.",
		pathname: requestUrl.pathname,
		timestamp: new Date().toISOString(),
	});
}
