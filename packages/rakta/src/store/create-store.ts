import { useSyncExternalStore } from "react";
import type { ListenerFn, SelectorFn, SetStateArg, StateCreator, StoreApi, UnsubscribeFn } from "./types";

function createStoreApi<TState>(creator: StateCreator<TState>): StoreApi<TState> {
    const listeners = new Set<ListenerFn<TState>>();
    let state : TState;
    const getState = (): TState => state;

    const setState = (arg: SetStateArg<TState>): void => {
        const prev = state;
        const partial = typeof arg === "function" ? arg(state) : arg;
        state = { ...state, ...partial };
        if (!Object.is(prev, state)) {
            listeners.forEach((fn) => fn(state, prev));
        };
    };

    const subscribe = (listener: ListenerFn<TState>): UnsubscribeFn => {
        listeners.add(listener);
        return () => {
            listeners.delete(listener);
        };
    };

    state = creator(setState, getState);
    const initialState = state;

    const reset = (): void => {
        const prev = state;
        state = initialState;
        if (!Object.is(prev, state)) {
            listeners.forEach((fn) => fn(state, prev));
        };
    };

    return { getState, setState, subscribe, reset };
};


export type UseStore<TState> = {
    (): TState;
    <TSelected>(selector: SelectorFn<TState, TSelected>): TSelected;
} & StoreApi<TState>;

/**
 * Creates a reactive Rakta Store:
 * 
 * Usage:
 *   const useCounterStore = createRaktaStore<CounterState>((set, get) => ({
 *      conut: 0,
 *      increment: () => set({ count: get().count + 1}),
 *   }));
 * 
 *   const count = useCounterStore(stores => stores.count);
 */

export function createRaktaStore<TState>( creator: StateCreator<TState> ): UseStore<TState> {
    const store = createStoreApi(creator);

    function useStore(): TState;
    function useStore<TSelected>(selector: SelectorFn<TState, TSelected>): TSelected;
    function useStore<TSelected>(
        selector?: SelectorFn<TState, TSelected>
    ): TState | TSelected {
        if (selector) {
            return useSyncExternalStore(
                store.subscribe,
                () => selector(store.getState()),
                () => selector(store.getState())
            );
        };

        return useSyncExternalStore(
            store.subscribe, 
            store.getState, 
            store.getState
        );
    }

    return Object.assign(
        useStore,
        store
    );
}