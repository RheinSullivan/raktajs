import { createServiceContainer } from "./container";
import { createRaktaEnvironment } from "./environment";
import type {
	RaktaFeatureRegistration,
	RaktaKernel,
	RaktaKernelOptions,
	RaktaPlugin,
	RaktaPluginContext,
} from "./types";

export function createRaktaKernel(
	options: RaktaKernelOptions = {},
): RaktaKernel {
	const services = createServiceContainer();
	const environment = createRaktaEnvironment(
		options.environmentName,
		options.env,
	);
	const features = new Map<string, RaktaFeatureRegistration<unknown>>();
	const plugins = new Map<string, RaktaPlugin>();
	let configured = false;
	let started = false;

	const kernel: RaktaKernel = {
		kernel: undefined as unknown as RaktaKernel,
		services,
		environment,

		registerFeature<TOptions = unknown>(
			feature: RaktaFeatureRegistration<TOptions>,
		) {
			if (features.has(feature.name)) {
				throw new Error(
					`Rakta feature "${feature.name}" is already registered.`,
				);
			}

			features.set(feature.name, feature as RaktaFeatureRegistration<unknown>);
		},

		hasFeature(name: string) {
			return features.has(name);
		},

		feature<TOptions = unknown>(name: string) {
			return features.get(name) as
				| RaktaFeatureRegistration<TOptions>
				| undefined;
		},

		use(plugin: RaktaPlugin) {
			if (started || configured) {
				throw new Error(
					`Rakta plugin "${plugin.name}" cannot be registered after the kernel has started.`,
				);
			}

			if (plugins.has(plugin.name)) {
				throw new Error(`Rakta plugin "${plugin.name}" is already registered.`);
			}

			plugins.set(plugin.name, plugin);
			return this;
		},

		async start() {
			if (started) {
				return;
			}

			configured = true;

			for (const plugin of plugins.values()) {
				await plugin.configure?.(this as RaktaPluginContext);
			}

			for (const plugin of plugins.values()) {
				await plugin.start?.(this as RaktaPluginContext);
			}

			started = true;

			for (const plugin of plugins.values()) {
				await plugin.ready?.(this as RaktaPluginContext);
			}
		},

		async shutdown() {
			if (!started) {
				return;
			}

			const orderedPlugins = Array.from(plugins.values()).reverse();

			for (const plugin of orderedPlugins) {
				await plugin.shutdown?.(this as RaktaPluginContext);
			}

			started = false;
		},

		snapshot() {
			return {
				environment: environment.name,
				features: Array.from(features.keys()).sort(),
				plugins: Array.from(plugins.keys()),
				services: services.keys(),
				started,
			};
		},
	};

	(kernel as { kernel: RaktaKernel }).kernel = kernel;

	for (const service of options.services ?? []) {
		services.register(service);
	}

	for (const plugin of options.plugins ?? []) {
		kernel.use(plugin);
	}

	return kernel;
}
