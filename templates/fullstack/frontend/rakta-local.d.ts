declare module "raktajs" {
	export interface AutoImportConfig {
		readonly enabled: boolean;
		readonly directories: readonly string[];
		readonly outputDirectory: string;
		readonly dts?: boolean;
	}

	export interface RaktaConfig {
		readonly appName?: string;
		readonly autoImport?: AutoImportConfig;
		readonly seo?: {
			readonly defaultTitle?: string;
			readonly defaultDescription?: string;
		};
		readonly render?: {
			readonly defaultMode?: string;
			readonly routes?: Readonly<Record<string, string>>;
		};
	}

	export function defineRaktaConfig(config: RaktaConfig): RaktaConfig;
}
