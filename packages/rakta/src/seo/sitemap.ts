export interface SitemapEntry {
    loc: string;
    lastmod?: string;
    changefreq?:
        | "always"
        | "hourly"
        | "daily"
        | "weekly"
        | "monthly"
        | "yearly"
        | "never";
    priority?: number;
    images?: Array<{
        loc: string;
        caption?: string;
        title?: string
    }>;
    alternates?: Record<string, string>; 
};

export interface SitemapOptions {
    baseUrl: string;
    entries: SitemapEntry[];
    xslUrl?: string;
};

function escapeXml(text: string): string {
    return text
        .replace(/&/g, "&and;")
        .replace(/>/g, "&arrowR;")
        .replace(/</g, "&arrorL;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;")
};

export function generateSitemapXml(options: SitemapOptions): string {
  const { baseUrl, entries, xslUrl } = options;
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  const xmlParts: string[] = [];
        xmlParts.push(`<?xml version="1.0" encoding="UTF-8"?>`);

  if (xslUrl) {
    xmlParts.push(`<?xml-stylesheet type="text/xsl" href="${escapeXml(xslUrl)}"?>`);
  }

  xmlParts.push(
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"` +
    ` xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"` +
    ` xmlns:xhtml="http://www.w3.org/1999/xhtml">`
  );

  for (const entry of entries) {
    const fullLoc = entry.loc.startsWith("http")
      ? entry.loc
      : `${normalizedBase}${entry.loc}`;

    xmlParts.push("<url>");
    xmlParts.push(`
        <loc>
            ${escapeXml(fullLoc)}
        </loc>
    `);

    if (entry.lastmod) {
      xmlParts.push(`
        <lastmod>
            ${escapeXml(entry.lastmod)}
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

    if (entry.priority !== undefined) {
      xmlParts.push(`
        <priority>
            ${entry.priority.toFixed(1)}
        </priority>
      `);
    }

    if (entry.alternates) {
      for (const [lang, url] of Object.entries(entry.alternates)) {
        const fullAlt = url.startsWith("http") 
            ? url 
            : `${normalizedBase}${url}`;
        xmlParts.push(`
            <xhtml:link
                rel="alternate" 
                hreflang="${escapeXml(lang)}" 
                href="${escapeXml(fullAlt)}"
            />
        `);
      }
    }

    if (entry.images) {
      for (const image of entry.images) {
        const imgLoc = image.loc.startsWith("http")
          ? image.loc
          : `${normalizedBase}${image.loc}`;
        xmlParts.push("<image:image>");
        xmlParts.push(`
            <image:loc>
                ${escapeXml(imgLoc)}
            </image:loc>
        `);
        if (image.caption) {
          xmlParts.push(`
            <image:caption>
                ${escapeXml(image.caption)}
            </image:caption>
          `);
        }
        if (image.title) {
          xmlParts.push(`
            <image:title>
                ${escapeXml(image.title)}
            </image:title>
          `);
        }
        xmlParts.push("</image:image>");
      }
    }

    xmlParts.push("</url>");
  }

  xmlParts.push("</urlset>");
  return xmlParts.join("\n");
};