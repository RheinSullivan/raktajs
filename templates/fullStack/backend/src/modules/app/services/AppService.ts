export class AppService {
	createCorsHeaders(corsOrigin: string): Headers {
		const headers = new Headers();
		headers.set("Access-Control-Allow-Origin", corsOrigin);
		headers.set(
			"Access-Control-Allow-Methods",
			"GET, POST, PUT, PATCH, DELETE, OPTIONS",
		);
		headers.set(
			"Access-Control-Allow-Headers",
			"Content-Type, Authorization, X-Requested-With",
		);
		headers.set("Access-Control-Allow-Credentials", "true");
		return headers;
	}
}
