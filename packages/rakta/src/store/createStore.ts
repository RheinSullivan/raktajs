import { useSyncExternalStore } from "react";
import type {
	ListenerFn,
	SelectorFn,
	SetStateArg,
	StateCreator,
	StoreApi,
	UnsubscribeFn,
} from "./types";

function createStoreApi<TState>(
	creator: StateCreator<TState>,
): StoreApi<TState> {
	const listeners = new Set<ListenerFn<TState>>();
	let currentState: TState;

	const getState = (): TState => currentState;

	const setState = (arg: SetStateArg<TState>): void => {
		const prevState = currentState;
		const partialUpdate = typeof arg === "function" ? arg(currentState) : arg;
		currentState = {
			...currentState,
			...partialUpdate,
		};

		if (!Object.is(prevState, currentState)) {
			listeners.forEach((listenerFn) => listenerFn(currentState, prevState));
		}
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
		const prevState = currentState;
		currentState = initialState;

		if (!Object.is(prevState, currentState)) {
			listeners.forEach((listenerFn) => listenerFn(currentState, prevState));
		}
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
 * WaliSignal-powered Rakta Store — creates a reactive state store with React hooks.
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
		if (selector !== undefined) {
			return useSyncExternalStore(
				storeApi.subscribe,
				() => selector(storeApi.getState()),
				() => selector(storeApi.getState()),
			);
		}

		return useSyncExternalStore(
			storeApi.subscribe,
			storeApi.getState,
			storeApi.getState,
		);
	}

	return Object.assign(useStore, storeApi);
}
