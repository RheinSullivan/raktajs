export interface PackageStats {
	readonly dependencies: number;
	readonly dependencyNames: readonly string[];
	readonly dependents: number | null;
	readonly version?: string;
	readonly updatedAt?: string;
}

const PACKAGE_NAME = "raktajs";
const CACHE_KEY = "rakta:package-stats:v1";
const CACHE_TTL_MS = 1000 * 60 * 60 * 6;

interface CachedPackageStats {
	readonly expiresAt: number;
	readonly stats: PackageStats;
}

function readObject(value: unknown): Record<string, unknown> | null {
	return typeof value === "object" && value !== null
		? (value as Record<string, unknown>)
		: null;
}

function readNumber(value: unknown): number | null {
	return typeof value === "number" && Number.isFinite(value) && value > 0
		? value
		: null;
}

export function parseRuntimeDependencies(
	metadata: unknown,
): Pick<
	PackageStats,
	"dependencies" | "dependencyNames" | "updatedAt" | "version"
> {
	const packageMetadata = readObject(metadata);
	const distTags = readObject(packageMetadata?.["dist-tags"]);
	const latestVersion =
		typeof distTags?.latest === "string" ? distTags.latest : undefined;
	const versions = readObject(packageMetadata?.versions);
	const versionMetadata =
		latestVersion !== undefined ? readObject(versions?.[latestVersion]) : null;
	const dependencyNames = Array.from(
		new Set([
			...Object.keys(readObject(versionMetadata?.dependencies) ?? {}),
			...Object.keys(readObject(versionMetadata?.peerDependencies) ?? {}),
		]),
	).sort();
	const time = readObject(packageMetadata?.time);

	const result: Pick<
		PackageStats,
		"dependencies" | "dependencyNames" | "updatedAt" | "version"
	> = {
		dependencies: dependencyNames.length,
		dependencyNames,
	};
	const updatedAt =
		latestVersion !== undefined && typeof time?.[latestVersion] === "string"
			? time[latestVersion]
			: undefined;
	const version =
		typeof versionMetadata?.version === "string"
			? versionMetadata.version
			: latestVersion;

	return {
		...result,
		...(updatedAt !== undefined ? { updatedAt } : {}),
		...(version !== undefined ? { version } : {}),
	};
}

export function parseDependentsCount(responseData: unknown): number | null {
	const root = readObject(responseData);
	if (root === null) return null;

	for (const key of ["dependents", "dependentCount", "dependentsCount"]) {
		const count = readNumber(root[key]);
		if (count !== null) return count;
	}

	const objects = Array.isArray(root.objects) ? root.objects : [];
	const match = objects.map(readObject).find((entry) => {
		const packageData = readObject(entry?.package);
		return packageData?.name === PACKAGE_NAME;
	});
	const packageData = readObject(match?.package);
	const collected = readObject(match?.collected);
	const metadata = readObject(collected?.metadata);

	for (const value of [
		packageData?.dependents,
		packageData?.dependentCount,
		packageData?.dependentsCount,
		metadata?.dependents,
		metadata?.dependentCount,
		metadata?.dependentsCount,
	]) {
		const count = readNumber(value);
		if (count !== null) return count;
	}

	return null;
}

export function getCachedPackageStats(): PackageStats | null {
	try {
		const raw = window.localStorage.getItem(CACHE_KEY);
		if (raw === null) return null;

		const cached = JSON.parse(raw) as CachedPackageStats;
		return cached.expiresAt > Date.now() ? cached.stats : null;
	} catch {
		return null;
	}
}

function setCachedPackageStats(stats: PackageStats): void {
	try {
		window.localStorage.setItem(
			CACHE_KEY,
			JSON.stringify({ expiresAt: Date.now() + CACHE_TTL_MS, stats }),
		);
	} catch {
		// Storage can be unavailable in private browsing; live data still renders.
	}
}

export async function fetchPackageStats(): Promise<PackageStats> {
	const cached = getCachedPackageStats();
	if (cached !== null) return cached;

	const [metadataResponse, dependentsResponse] = await Promise.all([
		fetch(`https://registry.npmjs.org/${PACKAGE_NAME}`, {
			headers: { Accept: "application/json" },
		}),
		fetch(
			`https://registry.npmjs.org/-/v1/search?text=package:${PACKAGE_NAME}&size=1`,
			{ headers: { Accept: "application/json" } },
		),
	]);

	if (!metadataResponse.ok) {
		throw new Error("Unable to load npm package metadata.");
	}

	const metadata = await metadataResponse.json();
	const dependentsData = dependentsResponse.ok
		? await dependentsResponse.json()
		: null;
	const stats: PackageStats = {
		...parseRuntimeDependencies(metadata),
		dependents: parseDependentsCount(dependentsData),
	};

	setCachedPackageStats(stats);
	return stats;
}
