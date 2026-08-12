export interface PackageStats {
	readonly dependencies: number;
	readonly dependencyNames: readonly string[];
	readonly dependents: number | null;
	readonly version?: string;
	readonly updatedAt?: string;
}

export interface PackageStatsOptions {
	readonly packageName?: string;
	readonly cacheTtlMs?: number;
}

interface NpmVersionMetadata {
	readonly version?: string;
	readonly dependencies?: Record<string, string>;
}

interface NpmPackageMetadata {
	readonly "dist-tags"?: {
		readonly latest?: string;
	};
	readonly time?: Record<string, string>;
	readonly versions?: Record<string, NpmVersionMetadata>;
}

const DEFAULT_PACKAGE_NAME = "raktajs";
const DEFAULT_CACHE_TTL_MS = 1000 * 60 * 60 * 6;
const memoryCache = new Map<
	string,
	{ readonly expiresAt: number; readonly stats: PackageStats }
>();

function readNumber(value: unknown): number | null {
	return typeof value === "number" && Number.isFinite(value) && value >= 0
		? value
		: null;
}

function readObject(value: unknown): Record<string, unknown> | null {
	return typeof value === "object" && value !== null
		? (value as Record<string, unknown>)
		: null;
}

export function parseRuntimeDependencies(
	metadata: unknown,
	packageName: string = DEFAULT_PACKAGE_NAME,
): Pick<
	PackageStats,
	"dependencies" | "dependencyNames" | "updatedAt" | "version"
> {
	const packageMetadata = readObject(metadata) as NpmPackageMetadata | null;
	const latestVersion = packageMetadata?.["dist-tags"]?.latest;
	const versionMetadata =
		latestVersion !== undefined
			? packageMetadata?.versions?.[latestVersion]
			: undefined;
	const dependencyNames = Object.keys(
		versionMetadata?.dependencies ?? {},
	).sort();

	const result: Pick<
		PackageStats,
		"dependencies" | "dependencyNames" | "updatedAt" | "version"
	> = {
		dependencies: dependencyNames.length,
		dependencyNames,
	};

	const updatedAt =
		latestVersion !== undefined
			? packageMetadata?.time?.[latestVersion]
			: undefined;
	if (updatedAt !== undefined) {
		return {
			...result,
			updatedAt,
			version: versionMetadata?.version ?? latestVersion ?? packageName,
		};
	}

	return {
		...result,
		version: versionMetadata?.version ?? latestVersion ?? packageName,
	};
}

export function parseDependentsCount(
	responseData: unknown,
	packageName: string = DEFAULT_PACKAGE_NAME,
): number | null {
	const root = readObject(responseData);
	if (root === null) return null;

	const directKeys = ["dependents", "dependentCount", "dependentsCount"];
	for (const key of directKeys) {
		const count = readNumber(root[key]);
		if (count !== null) return count;
	}

	const objects = Array.isArray(root.objects) ? root.objects : [];
	const match = objects.map(readObject).find((entry) => {
		const packageData = readObject(entry?.package);
		return packageData?.name === packageName;
	});

	if (!match) return null;

	const packageData = readObject(match.package);
	const collected = readObject(match.collected);
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

export async function fetchPackageStats(
	options: PackageStatsOptions = {},
): Promise<PackageStats> {
	const packageName = options.packageName ?? DEFAULT_PACKAGE_NAME;
	const cacheTtlMs = options.cacheTtlMs ?? DEFAULT_CACHE_TTL_MS;
	const cached = memoryCache.get(packageName);

	if (cached !== undefined && cached.expiresAt > Date.now()) {
		return cached.stats;
	}

	const metadataUrl = `https://registry.npmjs.org/${encodeURIComponent(packageName)}`;
	const dependentsUrl = `https://registry.npmjs.org/-/v1/search?text=package:${encodeURIComponent(packageName)}&size=1`;
	const [metadataResponse, dependentsResponse] = await Promise.all([
		fetch(metadataUrl, { headers: { Accept: "application/json" } }),
		fetch(dependentsUrl, { headers: { Accept: "application/json" } }),
	]);

	if (!metadataResponse.ok) {
		throw new Error(`Failed to load npm metadata for ${packageName}.`);
	}

	const metadata = await metadataResponse.json();
	const dependentsData = dependentsResponse.ok
		? await dependentsResponse.json()
		: null;
	const stats: PackageStats = {
		...parseRuntimeDependencies(metadata, packageName),
		dependents: parseDependentsCount(dependentsData, packageName),
	};

	memoryCache.set(packageName, {
		expiresAt: Date.now() + cacheTtlMs,
		stats,
	});

	return stats;
}
