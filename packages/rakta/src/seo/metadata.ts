export interface OpenGraphImage {
	url: string;
	width?: number;
	height?: number;
	alt?: string;
	type?: string;
}

export interface OpenGraph {
	type?: "website" | "article" | "book" | "profile";
	title?: string;
	description?: string;
	url?: string;
	siteName?: string;
	images?: OpenGraphImage[];
	locale?: string;
	audio?: string;
	video?: string;
	determiner?: string;
	countryName?: string;
}

export interface TwitterCard {
	card?: "summary" | "summary_large_image" | "app" | "player";
	site?: string;
	creator?: string;
	title?: string;
	description?: string;
	image?: string;
	imageAlt?: string;
}

export type JsonLdPrimitive = string | number | boolean;

export type JsonLdValue =
	| JsonLdPrimitive
	| JsonLdObject
	| readonly JsonLdValue[];

export interface JsonLdObject {
	readonly [key: string]: JsonLdValue;
}

export interface JsonLdGraph extends JsonLdObject {
	"@type": string;
}

export interface JsonLd extends JsonLdObject {
	"@context": string;
	"@graph"?: JsonLdGraph[];
	"@type"?: string;
}

export interface AlternateLinks {
	canonical?: string;
	languages?: Record<string, string>;
}

export interface RobotsGoogleBot {
	index?: boolean;
	follow?: boolean;
	noimageindex?: boolean;
	maxVideoPreview?: number;
	maxImagePreview?: "none" | "standard" | "large";
	maxSnippet?: number;
}

export interface Robots {
	index?: boolean;
	follow?: boolean;
	nocache?: boolean;
	googleBot?: RobotsGoogleBot;
}

export interface MetadataAuthor {
	name: string;
	url?: string;
}

export interface MetadataIconItem {
	url: string;
	sizes?: string;
	type?: string;
}

export interface MetadataAppleIconItem {
	url: string;
	sizes?: string;
}

export interface MetadataIcons {
	icon?: string | MetadataIconItem[];
	shortcut?: string;
	apple?: string | MetadataAppleIconItem[];
}

export type TitleMetadata =
	| string
	| {
			default: string;
			template?: string;
			absolute?: string;
	  };

export interface FormatDetection {
	email?: boolean;
	address?: boolean;
	telephone?: boolean;
}

export interface Metadata {
	title?: TitleMetadata;
	titleTemplate?: string;
	defaultTitle?: string;
	description?: string;
	keywords?: string | string[];
	authors?: MetadataAuthor[];
	creator?: string;
	publisher?: string;
	applicationName?: string;
	themeColor?: string;
	colorScheme?: "light" | "dark" | "light dark" | "dark light";
	viewport?: string;
	robots?: string | Robots;
	canonical?: string;
	alternates?: AlternateLinks;
	openGraph?: OpenGraph;
	twitter?: TwitterCard;
	jsonLd?: JsonLd | JsonLd[];
	icons?: MetadataIcons;
	manifest?: string;
	metadataBase?: URL | string;
	formatDetection?: FormatDetection;
	other?: Record<string, string | string[]>;
}

export function resolveTitle(metadata: Metadata): string {
	if (typeof metadata.title === "object" && metadata.title !== null) {
		if (metadata.title.absolute) {
			return metadata.title.absolute;
		}
		if (metadata.title.default) {
			const template = metadata.title.template ?? metadata.titleTemplate;
			if (template) {
				return template.replace("%s", metadata.title.default);
			}
			return metadata.title.default;
		}
	}

	const titleStr =
		typeof metadata.title === "string" ? metadata.title : undefined;

	if (!titleStr && metadata.defaultTitle) {
		return metadata.defaultTitle;
	}

	if (!titleStr) {
		return "";
	}

	if (metadata.titleTemplate) {
		return metadata.titleTemplate.replace("%s", titleStr);
	}

	return titleStr;
}

export function resolveRobotsContent(robots: string | Robots): string {
	if (typeof robots === "string") {
		return robots;
	}

	const directives: string[] = [];

	if (robots.index === false) {
		directives.push("noindex");
	} else {
		directives.push("index");
	}

	if (robots.follow === false) {
		directives.push("nofollow");
	} else {
		directives.push("follow");
	}

	if (robots.nocache) {
		directives.push("nocache");
	}

	return directives.join(", ");
}

export function mergeMetadata(base: Metadata, override: Metadata): Metadata {
	const mergedMetadata: Metadata = {
		...base,
		...override,
	};

	if (base.openGraph || override.openGraph) {
		mergedMetadata.openGraph = {
			...base.openGraph,
			...override.openGraph,
		};
	}

	if (base.twitter || override.twitter) {
		mergedMetadata.twitter = {
			...base.twitter,
			...override.twitter,
		};
	}

	if (base.alternates || override.alternates) {
		mergedMetadata.alternates = {
			...base.alternates,
			...override.alternates,
		};
	}

	if (base.icons || override.icons) {
		mergedMetadata.icons = {
			...base.icons,
			...override.icons,
		};
	}

	if (base.other || override.other) {
		mergedMetadata.other = {
			...base.other,
			...override.other,
		};
	}

	return mergedMetadata;
}

export type { GenerateMetadataFn } from "../router/types";
