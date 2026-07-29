// Head
export type { HeadProps } from "./head";

import { RaktaHead } from "./head";

// Metadata
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

import { mergeMetadata, resolveRobotsContent, resolveTitle } from "./metadata";

// Robots
export type {
	RobotsOptions,
	RobotsRule,
} from "./robots";

import { createRobotsHandler, generateRobotsTxt } from "./robots";

// Sitemap
export type {
	SitemapEntry,
	SitemapIndexEntry,
	SitemapOptions,
} from "./sitemap";

import {
	createSitemapHandler,
	generateSitemapIndexXml,
	generateSitemapXml,
} from "./sitemap";

export {
	createRobotsHandler,
	createSitemapHandler,
	generateRobotsTxt,
	generateSitemapIndexXml,
	generateSitemapXml,
	mergeMetadata,
	RaktaHead,
	resolveRobotsContent,
	resolveTitle,
};
