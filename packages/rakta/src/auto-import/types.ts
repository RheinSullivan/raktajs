export type AutoImportKind =
    | "component"
    | "hook"
    | "store"
    | "schema"
    | "utils"
    | "unknown";

export interface DiscoveredExport {
    readonly name: string;
    readonly filePath: string;
    readonly importPath: string;
    readonly kind: AutoImportKind;
};

export interface AutoImportManifest {
    readonly generatedAt: string;
    readonly sourceDirectories: ReadonlyArray<string>;
    readonly exports: ReadonlyArray<DiscoveredExport>;
};

export interface AutoImportGeneratorOptions {
    readonly frontendRoot: string;
    readonly directories: ReadonlyArray<string>;
    readonly outputDirectory: string;
    readonly extensions?: ReadonlyArray<string>;
    readonly generateDts: boolean;
};