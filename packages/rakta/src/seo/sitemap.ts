export type SitemapChangeFrequency =
	| "always"
	| "hourly"
	| "daily"
	| "weekly"
	| "monthly"
	| "yearly"
	| "never";

export interface SitemapImageEntry {
	loc: string;
	caption?: string;
	title?: string;
}

export interface SitemapEntry {
	loc: string;
	lastmod?: string;
	changefreq?: SitemapChangeFrequency;
	priority?: number;
	images?: SitemapImageEntry[];
	alternates?: Record<string, string>;
}

export interface SitemapOptions {
	baseUrl: string;
	entries: SitemapEntry[];
	xslUrl?: string;
}

export interface SitemapIndexEntry {
	loc: string;
	lastmod?: string;
}

function encodeRaktaXmlValue(text: string): string {
	return text
		.replace(/&/g, "&amp;")
		.replace(/'/g, "&apos;")
		.replace(/"/g, "&quot;")
		.replace(/>/g, "&gt;")
		.replace(/</g, "&lt;")
		.replace(/\r/g, "")
		.replace(/\n/g, "")
		.replace(/\t/g, " ")
		.trim();
}

function normalizeBaseUrl(baseUrl: string): string {
	return baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
}

function createAbsoluteUrl(baseUrl: string, loc: string): string {
	if (loc.startsWith("http://") || loc.startsWith("https://")) {
		return loc;
	}

	if (loc.startsWith("/")) {
		return `${baseUrl}${loc}`;
	}

	return `${baseUrl}/${loc}`;
}

function normalizePriority(priority: number): string {
	if (priority < 0) {
		return "0.0";
	}

	if (priority > 1) {
		return "1.0";
	}

	return priority.toFixed(1);
}

export function generateSitemapXml(options: SitemapOptions): string {
	const { baseUrl, entries, xslUrl } = options;
	const normalizedBase = normalizeBaseUrl(baseUrl);
	const xmlParts: string[] = [];

	xmlParts.push(`
    <?xml 
        version="1.0" 
        encoding="UTF-8"?
    >
`);

	if (xslUrl) {
		xmlParts.push(
			`<?xml-stylesheet 
        type="text/xsl"
        href="${encodeRaktaXmlValue(xslUrl)}"?
      >`,
		);
	}

	xmlParts.push(
		`<urlset ` +
			`xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" ` +
			`xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" ` +
			`xmlns:xhtml="http://www.w3.org/1999/xhtml">`,
	);

	for (const entry of entries) {
		const fullLoc = createAbsoluteUrl(normalizedBase, entry.loc);

		xmlParts.push(`<url>`);
		xmlParts.push(`
        <loc>
            ${encodeRaktaXmlValue(fullLoc)}
        </loc>
    `);

		if (entry.lastmod) {
			xmlParts.push(`
        <lastmod>
            ${encodeRaktaXmlValue(entry.lastmod)}
        </lastmod>
    `);
		}

		if (entry.changefreq) {
			xmlParts.push(`
        <changefreq>
            ${entry.changefreq}
        </changefreq>
    `);
		}

		if (typeof entry.priority === "number") {
			xmlParts.push(`
        <priority>
            ${normalizePriority(entry.priority)}
        </priority>
    `);
		}

		if (entry.alternates) {
			for (const [lang, url] of Object.entries(entry.alternates)) {
				const fullAlt = createAbsoluteUrl(normalizedBase, url);

				xmlParts.push(
					`<xhtml:link 
            rel="alternate" 
            hreflang="${encodeRaktaXmlValue(lang)}" 
            href="${encodeRaktaXmlValue(fullAlt)}"
          />`,
				);
			}
		}

		if (entry.images) {
			for (const image of entry.images) {
				const imageLoc = createAbsoluteUrl(normalizedBase, image.loc);

				xmlParts.push(`<image:image>`);
				xmlParts.push(`
            <image:loc>
                ${encodeRaktaXmlValue(imageLoc)}
            </image:loc>
        `);

				if (image.caption) {
					xmlParts.push(`
            <image:caption>
                ${encodeRaktaXmlValue(image.caption)}
            </image:caption>
          `);
				}

				if (image.title) {
					xmlParts.push(`
            <image:title>
                ${encodeRaktaXmlValue(image.title)}
            </image:title>
          `);
				}

				xmlParts.push(`</image:image>`);
			}
		}

		xmlParts.push(`</url>`);
	}

	xmlParts.push(`</urlset>`);
	return xmlParts.join("\n");
}

export function createSitemapHandler(options: SitemapOptions): () => Response {
	return () => {
		const xml = generateSitemapXml(options);

		return new Response(xml, {
			status: 200,
			headers: {
				"Content-Type": "application/xml; charset=utf-8",
				"Cache-Control": "public, max-age=3600, s-maxage=86400",
			},
		});
	};
}

export function generateSitemapIndexXml(
	baseUrl: string,
	sitemaps: SitemapIndexEntry[],
): string {
	const normalizedBase = normalizeBaseUrl(baseUrl);
	const xmlParts: string[] = [];

	xmlParts.push(`
        <?xml 
            version="1.0" 
            encoding="UTF-8"?
        >
    `);

	xmlParts.push(`
        <sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    `);

	for (const entry of sitemaps) {
		const fullLoc = createAbsoluteUrl(normalizedBase, entry.loc);

		xmlParts.push(`<sitemap>`);
		xmlParts.push(`
        <loc>
            ${encodeRaktaXmlValue(fullLoc)}
        </loc>
    `);

		if (entry.lastmod) {
			xmlParts.push(`
        <lastmod>
            ${encodeRaktaXmlValue(entry.lastmod)}
        </lastmod>
      `);
		}

		xmlParts.push(`</sitemap>`);
	}

	xmlParts.push(`</sitemapindex>`);
	return xmlParts.join("\n");
}
