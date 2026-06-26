// Head
export { RaktaHead } from "./head";
export type { HeadProps } from "./head"

// Metadata
export {
    resolveTitle,
    mergeMetadata,
    resolveRobotsContent,
} from "./metadata";

export type {
    Robots,
    JsonLd,
    Metadata,
    OpenGraph,
    JsonLdGraph,
    TwitterCard,
    OpenGraphImage,
    AlternateLinks,
    GenerateMetadataFn,
} from "./metadata";

// Sitemap
export {
    generateSitemapXml,
    createSitemapHandler,
    generateSitemapIndexXml,
} from "./sitemap";

export type {
    SitemapEntry,
    SitemapOptions,
    SitemapIndexEntry,
} from "./sitemap";

// Robots
export {
    generateRobotsTxt,
    createRobotsHandler
} from "./robots"

export type {
    RobotsRule,
    RobotsOptions,
} from "./robots"