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
		const getSnapshot = (): TState | TSelected => {
			const state = storeApi.getState();

			if (selector !== undefined) {
				return selector(state);
			}

			return state;
		};

		return useSyncExternalStore(storeApi.subscribe, getSnapshot, getSnapshot);
	}

	return Object.assign(useStore, storeApi);
}
