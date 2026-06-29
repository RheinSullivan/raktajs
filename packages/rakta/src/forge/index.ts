export { startDevServer } from "./dev-server";
export { buildProject } from "./build";
export { inspectBuild, printInspectReport } from "./inspect";

export type {
	ForgeDevServerOptions,
	ForgeBuildOptions,
	ForgeBuildArtifact,
	ForgeBuildResult,
	ForgeInspectReport,
	ForgeDevServerHandle,
	ForgeRouteModeEntry,
	ArtifactKind,
} from "./types";

export type { InspectOptions } from "./inspect";
