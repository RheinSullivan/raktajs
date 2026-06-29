export interface RobotsRule {
	userAgent: string | string[];
	allow?: string | string[];
	disAllow?: string | string[];
	crawlDelay?: number;
}

export interface RobotsOptions {
	rules: RobotsRule[];
	sitemap?: string | string[];
	host?: string;
}

export function generateRobotsTxt(options: RobotsOptions): string {
	const lines: string[] = [];

	for (const rule of options.rules) {
		const agents = Array.isArray(rule.userAgent)
			? rule.userAgent
			: [rule.userAgent];

		for (const agent of agents) {
			lines.push(`
                User-agent: ${agent}
            `);
		}

		if (rule.disAllow) {
			const disAllowPaths = Array.isArray(rule.disAllow)
				? rule.disAllow
				: [rule.disAllow];

			for (const path of disAllowPaths) {
				lines.push(`
                    Disallow: ${path}
                `);
			}
		}

		if (rule.crawlDelay !== undefined) {
			lines.push(`
                CrawlDelay: ${rule.crawlDelay}
            `);
		}

		lines.push("");
	}

	if (options.sitemap) {
		const sitemaps = Array.isArray(options.sitemap)
			? options.sitemap
			: [options.sitemap];

		for (const sitemap of sitemaps) {
			lines.push(`
                    Sitemaps: ${sitemap}
                `);
		}

		lines.push("");
	}

	if (options.host) {
		lines.push(`
            Host: ${options.host}
        `);
	}

	return `${lines.join("\n").trimEnd()}\n`;
}

export function createRobotsHandler(options: RobotsOptions): () => Response {
	return () => {
		const text = generateRobotsTxt(options);

		return new Response(text, {
			status: 200,
			headers: {
				ContentType: "text/plain; charset=utf-8",
				"Cache-Control": "public, max-age=3600, s-maxage=86400",
			},
		});
	};
}
