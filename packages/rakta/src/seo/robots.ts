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
			lines.push(`User-agent: ${agent}`);
		}

		if (rule.allow) {
			const allowPaths = Array.isArray(rule.allow) ? rule.allow : [rule.allow];

			for (const allowPath of allowPaths) {
				lines.push(`Allow: ${allowPath}`);
			}
		}

		if (rule.disAllow) {
			const disAllowPaths = Array.isArray(rule.disAllow)
				? rule.disAllow
				: [rule.disAllow];

			for (const disAllowPath of disAllowPaths) {
				lines.push(`Disallow: ${disAllowPath}`);
			}
		}

		if (rule.crawlDelay !== undefined) {
			lines.push(`Crawl-delay: ${rule.crawlDelay}`);
		}

		lines.push("");
	}

	if (options.sitemap) {
		const sitemaps = Array.isArray(options.sitemap)
			? options.sitemap
			: [options.sitemap];

		for (const sitemapUrl of sitemaps) {
			lines.push(`Sitemap: ${sitemapUrl}`);
		}

		lines.push("");
	}

	if (options.host) {
		lines.push(`Host: ${options.host}`);
	}

	return `${lines.join("\n").trimEnd()}\n`;
}

export function createRobotsHandler(options: RobotsOptions): () => Response {
	return () => {
		const robotsText = generateRobotsTxt(options);

		return new Response(robotsText, {
			status: 200,
			headers: {
				"Content-Type": "text/plain; charset=utf-8",
				"Cache-Control": "public, max-age=3600, s-maxage=86400",
			},
		});
	};
}
