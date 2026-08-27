export function ok<TData>(data: TData, status: number = 200): Response {
	return Response.json({ success: true, data }, { status });
}

export function created<TData>(data: TData): Response {
	return ok(data, 201);
}

export function fail(error: string, status: number = 400): Response {
	return Response.json({ success: false, error }, { status });
}
