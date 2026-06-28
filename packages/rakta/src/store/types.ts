export type SetStateArg<TState> =
    | Partial <TState>
    | ((current: TState) => Partial <TState>);

export type SetStateFn<TState> = (arg: SetStateArg<TState>) => void;
export type GetStateFn<TState> = () => TState;
export type SelectorFn<TState, TSelected> = (state: TState) => TSelected;
export type ListenerFn<TState> = (next: TState, prev: TState) => void;
export type UnsubscribeFn = () => void;

export type StateCreator<TState> = (
    set: SetStateFn<TState>,
    get: GetStateFn<TState>
) => TState;

export interface StoreApi<TState> {
    setState: SetStateFn<TState>;
    getState: GetStateFn<TState>;
    subscribe: (listener: ListenerFn<TState>) => UnsubscribeFn;
    reset: () => void;
}