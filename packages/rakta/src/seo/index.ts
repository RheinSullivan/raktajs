// Head

export type { HeadProps } from "./head";
export { RaktaHead } from "./head";
export type {
	AlternateLinks,
	FormatDetection,
	GenerateMetadataFn,
	JsonLd,
	JsonLdGraph,
	Metadata,
	OpenGraph,
	OpenGraphImage,
	Robots,
	TitleMetadata,
	TwitterCard,
} from "./metadata";
// Metadata
export {
	mergeMetadata,
	resolveRobotsContent,
	resolveTitle,
} from "./metadata";
export type {
	RobotsOptions,
	RobotsRule,
} from "./robots";
// Robots
export {
	createRobotsHandler,
	generateRobotsTxt,
} from "./robots";
export type {
	SitemapEntry,
	SitemapIndexEntry,
	SitemapOptions,
} from "./sitemap";
// Sitemap
export {
	createSitemapHandler,
	generateSitemapIndexXml,
	generateSitemapXml,
} from "./sitemap";
