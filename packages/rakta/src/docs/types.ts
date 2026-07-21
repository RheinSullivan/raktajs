export interface RaktaDocsPage {
	readonly path: string;
	readonly slug: string;
	readonly title: string;
	readonly locale: string;
	readonly headings: readonly string[];
	readonly excerpt: string;
}

export interface RaktaDocsSidebarItem {
	readonly text: string;
	readonly link: string;
	readonly items?: readonly RaktaDocsSidebarItem[];
}

export interface RaktaDocsSearchItem {
	readonly title: string;
	readonly slug: string;
	readonly locale: string;
	readonly excerpt: string;
	readonly headings: readonly string[];
}

export interface RaktaDocsManifest {
	readonly pages: readonly RaktaDocsPage[];
	readonly sidebar: readonly RaktaDocsSidebarItem[];
	readonly search: readonly RaktaDocsSearchItem[];
}

export interface RaktaDocsOptions {
	readonly rootDir: string;
	readonly locale?: string;
	readonly basePath?: string;
}

export interface RaktaVitePressConfig {
	readonly title: string;
	readonly description: string;
	readonly themeConfig: {
		readonly sidebar: readonly RaktaDocsSidebarItem[];
		readonly search: {
			readonly provider: "local";
		};
	};
}
