export type RaktaEnvironmentName =
	| "development"
	| "production"
	| "test"
	| (string & {});

export type RaktaServiceKey<_TValue> = string | symbol;

export type RaktaServiceFactory<TValue> = (
	container: RaktaServiceContainer,
) => TValue | Promise<TValue>;

export interface RaktaServiceRegistration<TValue> {
	readonly key: RaktaServiceKey<TValue>;
	readonly lifetime: "singleton" | "transient";
	readonly create: RaktaServiceFactory<TValue>;
}

export interface RaktaServiceContainer {
	register<TValue>(registration: RaktaServiceRegistration<TValue>): this;
	singleton<TValue>(
		key: RaktaServiceKey<TValue>,
		create: RaktaServiceFactory<TValue>,
	): this;
	value<TValue>(key: RaktaServiceKey<TValue>, value: TValue): this;
	has(key: RaktaServiceKey<unknown>): boolean;
	keys(): readonly string[];
	resolve<TValue>(key: RaktaServiceKey<TValue>): Promise<TValue>;
	tryResolve<TValue>(key: RaktaServiceKey<TValue>): Promise<TValue | undefined>;
	clear(): void;
}

export interface RaktaEnvironment {
	readonly name: RaktaEnvironmentName;
	readonly isDevelopment: boolean;
	readonly isProduction: boolean;
	readonly isTest: boolean;
	get(key: string): string | undefined;
	require(key: string): string;
	boolean(key: string, fallback?: boolean): boolean;
	number(key: string, fallback?: number): number;
	snapshot(): Readonly<Record<string, string>>;
}

export type RaktaLifecycleHook = (
	context: RaktaPluginContext,
) => void | Promise<void>;

export interface RaktaFeatureRegistration<TOptions = unknown> {
	readonly name: string;
	readonly options?: TOptions;
}

export interface RaktaPlugin {
	readonly name: string;
	readonly configure?: RaktaLifecycleHook;
	readonly start?: RaktaLifecycleHook;
	readonly ready?: RaktaLifecycleHook;
	readonly shutdown?: RaktaLifecycleHook;
}

export interface RaktaPluginContext {
	readonly kernel: RaktaKernel;
	readonly services: RaktaServiceContainer;
	readonly environment: RaktaEnvironment;
	registerFeature<TOptions = unknown>(
		feature: RaktaFeatureRegistration<TOptions>,
	): void;
	hasFeature(name: string): boolean;
	feature<TOptions = unknown>(
		name: string,
	): RaktaFeatureRegistration<TOptions> | undefined;
}

export interface RaktaKernelOptions {
	readonly environmentName?: RaktaEnvironmentName;
	readonly env?: Readonly<Record<string, string | undefined>>;
	readonly plugins?: readonly RaktaPlugin[];
	readonly services?: readonly RaktaServiceRegistration<unknown>[];
}

export interface RaktaKernelSnapshot {
	readonly environment: RaktaEnvironmentName;
	readonly features: readonly string[];
	readonly plugins: readonly string[];
	readonly services: readonly string[];
	readonly started: boolean;
}

export interface RaktaKernel extends RaktaPluginContext {
	use(plugin: RaktaPlugin): this;
	start(): Promise<void>;
	shutdown(): Promise<void>;
	snapshot(): RaktaKernelSnapshot;
}
