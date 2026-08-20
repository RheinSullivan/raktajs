import { useRef, useSyncExternalStore } from "react";
import type {
	ListenerFn,
	SelectorFn,
	SetStateArg,
	StateCreator,
	StoreApi,
	UnsubscribeFn,
} from "./types";

function shallowEqual(a: unknown, b: unknown): boolean {
	if (Object.is(a, b)) return true;
	if (
		typeof a !== "object" ||
		a === null ||
		typeof b !== "object" ||
		b === null
	) {
		return false;
	}

	const keysA = Object.keys(a);
	const keysB = Object.keys(b);

	if (keysA.length !== keysB.length) return false;

	for (const key of keysA) {
		if (
			!Object.hasOwn(b, key) ||
			!Object.is(
				(a as Record<string, unknown>)[key],
				(b as Record<string, unknown>)[key],
			)
		) {
			return false;
		}
	}

	return true;
}

function createStoreApi<TState>(
	creator: StateCreator<TState>,
): StoreApi<TState> {
	const listeners = new Set<ListenerFn<TState>>();
	let currentState: TState;

	const getState = (): TState => currentState;

	const emitChange = (nextState: TState, previousState: TState): void => {
		if (Object.is(previousState, nextState)) {
			return;
		}

		for (const listenerFn of listeners) {
			listenerFn(nextState, previousState);
		}
	};

	const setState = (arg: SetStateArg<TState>): void => {
		const previousState = currentState;
		const partialUpdate = typeof arg === "function" ? arg(currentState) : arg;

		currentState = {
			...currentState,
			...partialUpdate,
		};

		emitChange(currentState, previousState);
	};

	const subscribe = (listenerFn: ListenerFn<TState>): UnsubscribeFn => {
		listeners.add(listenerFn);

		return () => {
			listeners.delete(listenerFn);
		};
	};

	currentState = creator(setState, getState);
	const initialState = currentState;

	const reset = (): void => {
		const previousState = currentState;
		currentState = initialState;

		emitChange(currentState, previousState);
	};

	return {
		getState,
		setState,
		subscribe,
		reset,
	};
}

export type UseStore<TState> = {
	(): TState;
	<TSelected>(selector: SelectorFn<TState, TSelected>): TSelected;
} & StoreApi<TState>;

/**
 * WaliSignal-powered Rakta Store - creates a reactive state store with React hooks.
 *
 * Usage:
 *   const useCounterStore = createRaktaStore<CounterState>((set, get) => ({
 *     count: 0,
 *     increment: () => set({ count: get().count + 1 }),
 *   }));
 *
 *   const count = useCounterStore((state) => state.count);
 */
export function createRaktaStore<TState>(
	creator: StateCreator<TState>,
): UseStore<TState> {
	const storeApi = createStoreApi(creator);

	function useStore(): TState;
	function useStore<TSelected>(
		selector: SelectorFn<TState, TSelected>,
	): TSelected;
	function useStore<TSelected>(
		selector?: SelectorFn<TState, TSelected>,
	): TState | TSelected {
		const prevSliceRef = useRef<TSelected | TState | undefined>(undefined);
		const prevStateRef = useRef<TState | undefined>(undefined);

		const getSnapshot = (): TState | TSelected => {
			const state = storeApi.getState();

			if (selector === undefined) {
				return state;
			}

			if (
				prevStateRef.current === state &&
				prevSliceRef.current !== undefined
			) {
				return prevSliceRef.current;
			}

			const nextSlice = selector(state);

			if (
				prevSliceRef.current !== undefined &&
				shallowEqual(prevSliceRef.current, nextSlice)
			) {
				return prevSliceRef.current;
			}

			prevStateRef.current = state;
			prevSliceRef.current = nextSlice;
			return nextSlice;
		};

		return useSyncExternalStore(storeApi.subscribe, getSnapshot, getSnapshot);
	}

	return Object.assign(useStore, storeApi);
}
