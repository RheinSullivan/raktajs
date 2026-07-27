import {
	type DependencyList,
	useCallback,
	useEffect,
	useReducer,
	useRef,
} from "react";

// useRaktaData — lightweight data-fetching hook for Rakta.js
//
// Features:
// - request lifecycle (idle / loading / success / error)
// - in-memory deduplication: concurrent calls for the same key share one request
// - cancellation via AbortController on unmount or key change
// - manual refetch
// - automatic refetch on dependency change
// - no external dependencies

export type RaktaDataStatus = "idle" | "loading" | "success" | "error";

export interface RaktaDataState<T> {
	readonly data: T | undefined;
	readonly error: Error | undefined;
	readonly status: RaktaDataStatus;
	readonly loading: boolean;
}

export interface RaktaDataResult<T> extends RaktaDataState<T> {
	readonly refetch: () => void;
}

type Action<T> =
	| { type: "loading" }
	| { type: "success"; data: T }
	| { type: "error"; error: Error }
	| { type: "reset" };

function reducer<T>(
	state: RaktaDataState<T>,
	action: Action<T>,
): RaktaDataState<T> {
	switch (action.type) {
		case "loading":
			return { ...state, status: "loading", loading: true };
		case "success":
			return {
				data: action.data,
				error: undefined,
				status: "success",
				loading: false,
			};
		case "error":
			return {
				...state,
				error: action.error,
				status: "error",
				loading: false,
			};
		case "reset":
			return {
				data: undefined,
				error: undefined,
				status: "idle",
				loading: false,
			};
	}
}

const initialState = <T>(): RaktaDataState<T> => ({
	data: undefined,
	error: undefined,
	status: "idle",
	loading: false,
});

// Global in-memory deduplication map.
// Maps a dedup key to the in-flight Promise so concurrent callers share one fetch.
const inFlight = new Map<string, Promise<unknown>>();

/**
 * useRaktaData — data-fetching hook.
 *
 * @param fetcher  Async function that returns the data. Receives an AbortSignal.
 * @param deps     Dependency list — refetches when any dep changes (like useEffect).
 * @param key      Optional deduplication key. Same-key concurrent calls share one request.
 *
 * @example
 * const { data, loading, error, refetch } = useRaktaData(
 *   (signal) => fetch("/api/report", { signal }).then(r => r.json()),
 *   [],
 *   "report"
 * );
 */
export function useRaktaData<T>(
	fetcher: (signal: AbortSignal) => Promise<T>,
	deps: DependencyList = [],
	key?: string,
): RaktaDataResult<T> {
	const [state, dispatch] = useReducer(reducer<T>, undefined, initialState<T>);

	// Keep a stable ref to the fetcher so we don't need it in deps
	const fetcherRef = useRef(fetcher);
	fetcherRef.current = fetcher;

	// Increment to trigger manual refetch
	const [refetchCounter, incrementRefetch] = useReducer(
		(n: number) => n + 1,
		0,
	);

	const run = useCallback(
		(signal: AbortSignal) => {
			dispatch({ type: "loading" });

			const dedupKey = key ?? "";
			const existing = dedupKey ? inFlight.get(dedupKey) : undefined;
			const promise: Promise<T> = existing
				? (existing as Promise<T>)
				: fetcherRef.current(signal);

			if (dedupKey && !existing) {
				inFlight.set(dedupKey, promise);
			}

			promise
				.then((data) => {
					if (!signal.aborted) {
						dispatch({ type: "success", data });
					}
				})
				.catch((err: unknown) => {
					if (!signal.aborted) {
						dispatch({
							type: "error",
							error: err instanceof Error ? err : new Error(String(err)),
						});
					}
				})
				.finally(() => {
					if (dedupKey) inFlight.delete(dedupKey);
				});
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[key],
	);

	// biome-ignore lint/correctness/useExhaustiveDependencies: refetchCounter is the manual-refetch trigger — removing it breaks refetch()
	useEffect(() => {
		const controller = new AbortController();
		run(controller.signal);
		return () => {
			controller.abort();
		};
	}, [...deps, refetchCounter, run]);

	const refetch = useCallback(() => {
		incrementRefetch();
	}, []);

	return { ...state, refetch };
}
