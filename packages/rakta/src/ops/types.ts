export interface RaktaRequestContext {
	readonly requestId: string;
	readonly pathname: string;
	readonly method: string;
	readonly headers: Headers;
}

export interface RaktaJob<TPayload = unknown> {
	readonly id: string;
	readonly name: string;
	readonly payload: TPayload;
}

export interface RaktaQueuedJob<TPayload = unknown> extends RaktaJob<TPayload> {
	readonly queuedAt: number;
}

export interface RaktaCronTask {
	readonly name: string;
	readonly intervalMs: number;
	run(): Promise<void> | void;
}

export interface RaktaEvent<TPayload = unknown> {
	readonly name: string;
	readonly payload: TPayload;
}
