import { Fragment, type ReactElement } from "react";
import {
	type JsonLd,
	type Metadata,
	type OpenGraphImage,
	resolveRobotsContent,
	resolveTitle,
} from "./metadata";

export interface HeadProps {
	metadata: Metadata;
}

function KeywordsContent(keywords: string | string[]): string {
	return Array.isArray(keywords) ? keywords.join(", ") : keywords;
}

function getAuthorKey(authorName: string): string {
	return `author-${authorName}`;
}

function getIconKey(
	prefix: string,
	iconUrl: string,
	iconSizes?: string,
): string {
	if (iconSizes && iconSizes.length > 0) {
		return `${prefix}-${iconUrl}-${iconSizes}`;
	}

	return `${prefix}-${iconUrl}`;
}

function getOpenGraphImageKey(image: OpenGraphImage): string {
	const width = image.width ? String(image.width) : "auto-width";
	const height = image.height ? String(image.height) : "auto-height";

	return `og-image-${image.url}-${width}-${height}`;
}

function getJsonLdKey(schema: JsonLd): string {
	return `jsonld-${JSON.stringify(schema)}`;
}

export function RaktaHead({ metadata }: HeadProps): ReactElement {
	const resolvedTitle = resolveTitle(metadata);

	const robotsContent = metadata.robots
		? resolveRobotsContent(metadata.robots)
		: "";

	const jsonLdArray: JsonLd[] = metadata.jsonLd
		? Array.isArray(metadata.jsonLd)
			? metadata.jsonLd
			: [metadata.jsonLd]
		: [];

	const canonical = metadata.canonical ?? metadata.alternates?.canonical ?? "";

	return (
		<>
			{/* Title meta */}
			{resolvedTitle && <title>{resolvedTitle}</title>}

			{/* Core meta */}
			{metadata.description && (
				<meta name="description" content={metadata.description} />
			)}
			{metadata.keywords && (
				<meta name="keywords" content={KeywordsContent(metadata.keywords)} />
			)}
			{metadata.applicationName && (
				<meta name="application-name" content={metadata.applicationName} />
			)}
			{metadata.creator && <meta name="author" content={metadata.creator} />}
			{metadata.publisher && (
				<meta name="publisher" content={metadata.publisher} />
			)}
			{metadata.colorScheme && (
				<meta name="color-scheme" content={metadata.colorScheme} />
			)}
			{robotsContent && <meta name="robots" content={robotsContent} />}
			{metadata.viewport && (
				<meta name="viewport" content={metadata.viewport} />
			)}

			{/* Authors meta */}
			{metadata.authors?.map((author) => (
				<meta
					key={getAuthorKey(author.name)}
					name="author"
					content={author.name}
				/>
			))}

			{/* Canonical meta */}
			{canonical && <link rel="canonical" href={canonical} />}

			{/* Alternate languages meta */}
			{metadata.alternates?.languages &&
				Object.entries(metadata.alternates.languages).map(([lang, url]) => (
					<link rel="alternate" key={lang} hrefLang={lang} href={url} />
				))}

			{/* Manifest */}
			{metadata.manifest && <link rel="manifest" href={metadata.manifest} />}

			{/* Icons */}
			{metadata.icons?.icon &&
				(typeof metadata.icons.icon === "string" ? (
					<link rel="icon" href={metadata.icons.icon} />
				) : (
					metadata.icons.icon.map((icon) => (
						<link
							key={getIconKey("icon", icon.url, icon.sizes)}
							rel="icon"
							href={icon.url}
							sizes={icon.sizes}
							type={icon.type}
						/>
					))
				))}
			{metadata.icons?.shortcut && (
				<link rel="shortcut icon" href={metadata.icons.shortcut} />
			)}
			{metadata.icons?.apple &&
				(typeof metadata.icons.apple === "string" ? (
					<link rel="apple-touch-icon" href={metadata.icons.apple} />
				) : (
					metadata.icons.apple.map((icon) => (
						<link
							key={getIconKey("apple", icon.url, icon.sizes)}
							rel="apple-touch-icon"
							href={icon.url}
							sizes={icon.sizes}
						/>
					))
				))}

			{/* Open Graph */}
			{metadata.openGraph && (
				<>
					{(metadata.openGraph.title ?? resolvedTitle) && (
						<meta
							property="og:title"
							content={metadata.openGraph.title ?? resolvedTitle}
						/>
					)}
					{(metadata.openGraph.description ?? metadata.description) && (
						<meta
							property="og:description"
							content={
								metadata.openGraph.description ?? metadata.description ?? ""
							}
						/>
					)}
					{metadata.openGraph.type && (
						<meta property="og:type" content={metadata.openGraph.type} />
					)}
					{metadata.openGraph.url && (
						<meta property="og:url" content={metadata.openGraph.url} />
					)}
					{metadata.openGraph.siteName && (
						<meta
							property="og:site_name"
							content={metadata.openGraph.siteName}
						/>
					)}
					{metadata.openGraph.locale && (
						<meta property="og:locale" content={metadata.openGraph.locale} />
					)}
					{metadata.openGraph.images?.map((image: OpenGraphImage) => (
						<Fragment key={getOpenGraphImageKey(image)}>
							<meta property="og:image" content={image.url} />
							{image.width && (
								<meta property="og:image:width" content={String(image.width)} />
							)}
							{image.height && (
								<meta
									property="og:image:height"
									content={String(image.height)}
								/>
							)}
							{image.alt && (
								<meta property="og:image:alt" content={image.alt} />
							)}
							{image.type && (
								<meta property="og:image:type" content={image.type} />
							)}
						</Fragment>
					))}
				</>
			)}

			{/* Twitter Card */}
			{metadata.twitter && (
				<>
					<meta
						name="twitter:card"
						content={metadata.twitter.card ?? "summary"}
					/>
					{metadata.twitter.site && (
						<meta name="twitter:site" content={metadata.twitter.site} />
					)}
					{metadata.twitter.creator && (
						<meta name="twitter:creator" content={metadata.twitter.creator} />
					)}
					{(metadata.twitter.title ?? resolvedTitle) && (
						<meta
							name="twitter:title"
							content={metadata.twitter.title ?? resolvedTitle}
						/>
					)}
					{(metadata.twitter.description ?? metadata.description) && (
						<meta
							name="twitter:description"
							content={
								metadata.twitter.description ?? metadata.description ?? ""
							}
						/>
					)}
					{metadata.twitter.image && (
						<meta name="twitter:image" content={metadata.twitter.image} />
					)}
					{metadata.twitter.imageAlt && (
						<meta
							name="twitter:image:alt"
							content={metadata.twitter.imageAlt}
						/>
					)}
				</>
			)}

			{/* Custom meta */}
			{metadata.other &&
				Object.entries(metadata.other).map(([name, content]) => {
					const contentValue = Array.isArray(content)
						? content.join(", ")
						: content;

					return <meta key={name} name={name} content={contentValue} />;
				})}

			{/* JSON-LD */}
			{jsonLdArray.map((schema) => (
				<script key={getJsonLdKey(schema)} type="application/ld+json">
					{JSON.stringify(schema)}
				</script>
			))}
		</>
	);
}

export default RaktaHead;
