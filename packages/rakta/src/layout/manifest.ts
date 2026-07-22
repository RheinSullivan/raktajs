import type {
	RaktaLayoutEntry,
	RaktaLayoutFile,
	RaktaLayoutKind,
	RaktaLayoutManifest,
} from "./types";

const LAYOUT_FILE_NAMES = new Set([
	"layout.tsx",
	"layout.jsx",
	"layout.ts",
	"layout.js",
]);

const SPECIAL_LAYOUTS: Readonly<Record<string, RaktaLayoutKind>> = {
	"error.tsx": "error",
	"error.jsx": "error",
	"error.ts": "error",
	"error.js": "error",
	"loading.tsx": "loading",
	"loading.jsx": "loading",
	"loading.ts": "loading",
	"loading.js": "loading",
	"notFound.tsx": "not-found",
	"notFound.jsx": "not-found",
	"notFound.ts": "not-found",
	"notFound.js": "not-found",
	"not-found.tsx": "not-found",
	"not-found.jsx": "not-found",
	"not-found.ts": "not-found",
	"not-found.js": "not-found",
};

export function createLayoutManifest(
	files: readonly RaktaLayoutFile[],
): RaktaLayoutManifest {
	const entries = files
		.map((file) => toLayoutEntry(file.path))
		.filter((entry): entry is RaktaLayoutEntry => entry !== undefined)
		.sort(
			(left, right) =>
				left.order - right.order || left.id.localeCompare(right.id),
		);
	const root = entries.find(
		(entry) => entry.kind === "root" && entry.routePattern === "/",
	);

	return root === undefined ? { entries } : { root, entries };
}

export function matchLayouts(
	manifest: RaktaLayoutManifest,
	pathname: string,
): readonly RaktaLayoutEntry[] {
	const normalizedPathname = normalizeRoute(pathname);

	return manifest.entries.filter((entry) => {
		if (entry.kind === "parallel") {
			return normalizedPathname.startsWith(entry.routePattern);
		}

		return (
			entry.routePattern === "/" ||
			normalizedPathname === entry.routePattern ||
			normalizedPathname.startsWith(`${entry.routePattern}/`)
		);
	});
}

function toLayoutEntry(filePath: string): RaktaLayoutEntry | undefined {
	const normalizedPath = filePath.replaceAll("\\", "/");
	const fileName = normalizedPath.split("/").at(-1) ?? "";
	const segments = normalizedPath.split("/").filter(Boolean);
	const appIndex = segments.indexOf("app");

	if (appIndex === -1) {
		return undefined;
	}

	if (LAYOUT_FILE_NAMES.has(fileName)) {
		return createEntry(normalizedPath, segments, appIndex, fileName, "nested");
	}

	const specialKind = SPECIAL_LAYOUTS[fileName];

	if (specialKind !== undefined) {
		return createEntry(
			normalizedPath,
			segments,
			appIndex,
			fileName,
			specialKind,
		);
	}

	return undefined;
}

function createEntry(
	filePath: string,
	segments: readonly string[],
	appIndex: number,
	fileName: string,
	kind: RaktaLayoutKind,
): RaktaLayoutEntry {
	const routeSegments = segments.slice(appIndex + 1, -1);
	const slotSegment = routeSegments.find((segment) => segment.startsWith("@"));
	const isGroup = routeSegments.some(
		(segment) => segment.startsWith("(") && segment.endsWith(")"),
	);
	const routePattern = routeSegmentsToPattern(routeSegments);
	const resolvedKind =
		fileName.startsWith("layout.") && routePattern === "/"
			? "root"
			: slotSegment !== undefined
				? "parallel"
				: isGroup
					? "group"
					: kind;

	const entry: RaktaLayoutEntry = {
		id: `${resolvedKind}:${routePattern}:${filePath}`,
		kind: resolvedKind,
		routePattern,
		filePath,
		order: routePattern === "/" ? 0 : routePattern.split("/").length,
	};
	const parentId = parentPattern(routePattern);
	const slot = slotSegment?.slice(1);

	return {
		...entry,
		...(parentId === undefined ? {} : { parentId }),
		...(slot === undefined ? {} : { slot }),
	};
}

function routeSegmentsToPattern(segments: readonly string[]): string {
	const routeSegments = segments
		.filter((segment) => !segment.startsWith("@"))
		.filter((segment) => !(segment.startsWith("(") && segment.endsWith(")")));

	if (routeSegments.length === 0) {
		return "/";
	}

	return normalizeRoute(`/${routeSegments.join("/")}`);
}

function parentPattern(routePattern: string): string | undefined {
	if (routePattern === "/") {
		return undefined;
	}

	const parent = routePattern.split("/").slice(0, -1).join("/");
	return parent.length === 0 ? "/" : parent;
}

function normalizeRoute(pathname: string): string {
	const normalized = pathname.startsWith("/") ? pathname : `/${pathname}`;
	return normalized.length > 1 ? normalized.replace(/\/+$/, "") : normalized;
}
