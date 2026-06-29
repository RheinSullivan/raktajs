export type SetStateArg<TState> =
	| Partial<TState>
	| ((current: TState) => Partial<TState>);

export type SetStateFn<TState> = (arg: SetStateArg<TState>) => void;
export type GetStateFn<TState> = () => TState;
export type SelectorFn<TState, TSelected> = (state: TState) => TSelected;
export type ListenerFn<TState> = (nextState: TState, prevState: TState) => void;
export type UnsubscribeFn = () => void;

export type StateCreator<TState> = (
	setState: SetStateFn<TState>,
	getState: GetStateFn<TState>,
) => TState;

export interface StoreApi<TState> {
	readonly setState: SetStateFn<TState>;
	readonly getState: GetStateFn<TState>;
	readonly subscribe: (listener: ListenerFn<TState>) => UnsubscribeFn;
	readonly reset: () => void;
}
