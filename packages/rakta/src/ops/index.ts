import type {
	RaktaCronTask,
	RaktaEvent,
	RaktaJob,
	RaktaQueuedJob,
	RaktaRequestContext,
} from "./types";

export function createRequestContext(request: Request): RaktaRequestContext {
	const url = new URL(request.url);

	return {
		requestId: crypto.randomUUID(),
		pathname: url.pathname,
		method: request.method,
		headers: request.headers,
	};
}

export class RaktaQueue {
	readonly #jobs: RaktaQueuedJob[] = [];

	push<TPayload>(
		job: RaktaJob<TPayload>,
		now = Date.now(),
	): RaktaQueuedJob<TPayload> {
		const queuedJob: RaktaQueuedJob<TPayload> = {
			...job,
			queuedAt: now,
		};

		this.#jobs.push(queuedJob);
		return queuedJob;
	}

	shift(): RaktaQueuedJob | undefined {
		return this.#jobs.shift();
	}

	size(): number {
		return this.#jobs.length;
	}
}

export class RaktaEventBus {
	readonly #listeners = new Map<string, Set<(event: RaktaEvent) => void>>();

	on<TPayload>(
		name: string,
		listener: (event: RaktaEvent<TPayload>) => void,
	): () => void {
		const listeners = this.#listeners.get(name) ?? new Set();
		const wrappedListener = listener as (event: RaktaEvent) => void;
		listeners.add(wrappedListener);
		this.#listeners.set(name, listeners);

		return () => {
			listeners.delete(wrappedListener);
		};
	}

	emit<TPayload>(event: RaktaEvent<TPayload>): void {
		for (const listener of this.#listeners.get(event.name) ?? []) {
			listener(event as RaktaEvent);
		}
	}
}

export async function runCronTask(task: RaktaCronTask): Promise<string> {
	await task.run();
	return task.name;
}

export type {
	RaktaCronTask,
	RaktaEvent,
	RaktaJob,
	RaktaQueuedJob,
	RaktaRequestContext,
} from "./types";
