import type {
	RaktaServiceContainer,
	RaktaServiceKey,
	RaktaServiceRegistration,
} from "./types";

function formatServiceKey(key: RaktaServiceKey<unknown>): string {
	return typeof key === "symbol" ? (key.description ?? key.toString()) : key;
}

export function createServiceContainer(): RaktaServiceContainer {
	const registrations = new Map<
		RaktaServiceKey<unknown>,
		RaktaServiceRegistration<unknown>
	>();
	const singletons = new Map<RaktaServiceKey<unknown>, unknown>();
	const resolving = new Set<RaktaServiceKey<unknown>>();

	return {
		register<TValue>(registration: RaktaServiceRegistration<TValue>) {
			if (registrations.has(registration.key)) {
				throw new Error(
					`Rakta service "${formatServiceKey(registration.key)}" is already registered.`,
				);
			}

			registrations.set(
				registration.key,
				registration as RaktaServiceRegistration<unknown>,
			);
			return this;
		},

		singleton<TValue>(
			key: RaktaServiceKey<TValue>,
			create: RaktaServiceRegistration<TValue>["create"],
		) {
			return this.register({
				key,
				lifetime: "singleton",
				create,
			});
		},

		value<TValue>(key: RaktaServiceKey<TValue>, value: TValue) {
			return this.singleton(key, () => value);
		},

		has(key: RaktaServiceKey<unknown>) {
			return registrations.has(key);
		},

		keys() {
			return Array.from(registrations.keys(), formatServiceKey).sort();
		},

		async resolve<TValue>(key: RaktaServiceKey<TValue>): Promise<TValue> {
			const registration = registrations.get(key);

			if (registration === undefined) {
				throw new Error(
					`Rakta service "${formatServiceKey(key)}" has not been registered.`,
				);
			}

			if (registration.lifetime === "singleton" && singletons.has(key)) {
				return singletons.get(key) as TValue;
			}

			if (resolving.has(key)) {
				throw new Error(
					`Circular Rakta service dependency detected at "${formatServiceKey(key)}".`,
				);
			}

			resolving.add(key);

			try {
				const value = await registration.create(this);

				if (registration.lifetime === "singleton") {
					singletons.set(key, value);
				}

				return value as TValue;
			} finally {
				resolving.delete(key);
			}
		},

		async tryResolve<TValue>(
			key: RaktaServiceKey<TValue>,
		): Promise<TValue | undefined> {
			if (!registrations.has(key)) {
				return undefined;
			}

			return this.resolve(key);
		},

		clear() {
			registrations.clear();
			singletons.clear();
			resolving.clear();
		},
	};
}
