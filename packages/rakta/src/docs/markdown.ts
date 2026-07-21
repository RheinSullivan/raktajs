import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import type {
	RaktaDocsManifest,
	RaktaDocsOptions,
	RaktaDocsPage,
	RaktaDocsSearchItem,
	RaktaDocsSidebarItem,
	RaktaVitePressConfig,
} from "./types";

function listMarkdownFiles(rootDir: string): string[] {
	const entries = readdirSync(rootDir);
	const files: string[] = [];

	for (const entry of entries) {
		const entryPath = join(rootDir, entry);
		const stats = statSync(entryPath);

		if (stats.isDirectory()) {
			files.push(...listMarkdownFiles(entryPath));
			continue;
		}

		if (entryPath.endsWith(".md")) {
			files.push(entryPath);
		}
	}

	return files.sort();
}

function titleFromMarkdown(markdown: string, fallback: string): string {
	const heading = markdown.match(/^#\s+(.+)$/m)?.[1];
	return heading ?? fallback;
}

function headingsFromMarkdown(markdown: string): string[] {
	return Array.from(markdown.matchAll(/^#{2,6}\s+(.+)$/gm), (match) => match[1])
		.filter((heading): heading is string => heading !== undefined)
		.slice(0, 24);
}

function excerptFromMarkdown(markdown: string): string {
	return (
		markdown
			.replaceAll(/```[\s\S]*?```/g, "")
			.split("\n")
			.map((line) => line.trim())
			.find((line) => line.length > 0 && !line.startsWith("#"))
			?.slice(0, 180) ?? ""
	);
}

function slugFromPath(
	rootDir: string,
	filePath: string,
	basePath: string,
): string {
	const withoutExtension = relative(rootDir, filePath).replace(/\.md$/, "");
	const normalized = withoutExtension.split(sep).join("/");
	const slug = normalized.toLowerCase() === "readme" ? "" : normalized;
	return `${basePath}/${slug}`.replaceAll(/\/+/g, "/");
}

function sidebarItemFromPage(page: RaktaDocsPage): RaktaDocsSidebarItem {
	return {
		text: page.title,
		link: page.slug.length === 0 ? "/" : page.slug,
	};
}

export function scanMarkdownDocs(options: RaktaDocsOptions): RaktaDocsManifest {
	const basePath = options.basePath ?? "/";
	const locale = options.locale ?? "en";
	const pages = listMarkdownFiles(options.rootDir).map((filePath) => {
		const markdown = readFileSync(filePath, "utf8");
		const fallbackTitle = relative(options.rootDir, filePath).replace(
			/\.md$/,
			"",
		);

		return {
			path: filePath,
			slug: slugFromPath(options.rootDir, filePath, basePath),
			title: titleFromMarkdown(markdown, fallbackTitle),
			locale,
			headings: headingsFromMarkdown(markdown),
			excerpt: excerptFromMarkdown(markdown),
		};
	});

	const sidebar = pages.map(sidebarItemFromPage);
	const search: RaktaDocsSearchItem[] = pages.map((page) => ({
		title: page.title,
		slug: page.slug,
		locale: page.locale,
		excerpt: page.excerpt,
		headings: page.headings,
	}));

	return { pages, sidebar, search };
}

export function createVitePressConfig(
	manifest: RaktaDocsManifest,
	options: {
		readonly title: string;
		readonly description: string;
	},
): RaktaVitePressConfig {
	return {
		title: options.title,
		description: options.description,
		themeConfig: {
			sidebar: manifest.sidebar,
			search: {
				provider: "local",
			},
		},
	};
}
