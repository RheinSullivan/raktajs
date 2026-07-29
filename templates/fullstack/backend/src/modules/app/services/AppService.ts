export class AppService {
	readonly startedAt = new Date();

	uptimeMs(): number {
		return Date.now() - this.startedAt.getTime();
	}

	createCorsHeaders(origin: string): Headers {
		return new Headers({
			"Access-Control-Allow-Origin": origin,
			"Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
			"Access-Control-Allow-Headers": "Content-Type, Authorization",
			"Access-Control-Allow-Credentials": "true",
		});
	}
}
