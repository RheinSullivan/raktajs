import type { BackendFramework, ProjectConfig, ProjectFile } from "../types";

export type ImplementationStatus =
	| "IMPLEMENTED"
	| "PARTIAL"
	| "STRUCTURAL"
	| "BLOCKED"
	| "PLANNED";

export interface BackendCapabilities {
	readonly framework: BackendFramework;
	readonly language: string;
	readonly runtime: string;
	readonly defaultDatabase: string;
	readonly supportedDatabases: readonly string[];
	readonly authentication: string;
	readonly middleware: string;
	readonly validation: string;
	readonly apiType: string;
	readonly developmentCommand: string;
	readonly productionCommand: string;
	readonly databaseDriver: string;
	readonly sawitDatabaseSupport: boolean;
	readonly generationStatus: ImplementationStatus;
}

export interface BackendAdapter {
	readonly identifier: BackendFramework;
	readonly name: string;
	readonly language: string;
	readonly runtime: string;
	readonly capabilities: BackendCapabilities;
	generateFiles(projectConfiguration: ProjectConfig): ProjectFile[];
}
