export const metadata: Metadata = {
	title: {
		default: "Rakta.js — Ultra-Fast Frontend Framework",
		template: "%s | Rakta.js",
	},
	description:
		"Rakta.js is an ultra-lightweight fullstack framework built on Bun, React, and TypeScript. Created by Muhammad Rizky Ramadhan (Rhein Sullivan) from Cirebon & Jakarta Selatan, Indonesia — unifying File-based App Routing, Auto Import, Type-Safe RPC, and built-in Authentication into a single blazing-fast ecosystem.",
	keywords: [
		"Rakta.js",
		"Framework Frontend",
		"React Framework",
		"Cirebon",
		"Nusantara",
		"Javascript Frontend Framework",
		"Indonesia Developer",
		"Rhein Sullivan",
		"Vyagra Nexus",
		"Muhammad Rizky Ramadhan",
		"Type-Safe RPC",
		"Auto Import",
		"Bun Framework",
		"TypeScript Framework",
		"Fullstack React",
	],
	authors: [{ name: "Muhammad Rizky Ramadhan", url: "https://github.com/RheinSullivan" }],
	creator: "Rhein Sullivan",
	publisher: "Vyagra Nexus",
	applicationName: "Rakta.js",
	formatDetection: {
		email: false,
		address: false,
		telephone: false,
	},
	openGraph: {
		type: "website",
		title: "Rakta.js — Ultra-Fast Frontend Framework | Nusantara Ecosystem",
		description:
			"An ultra-lightweight fullstack framework unifying App Routing, Auto Import, Type-Safe RPC, and built-in Auth. Built on Bun + React + TypeScript.",
		siteName: "Rakta.js",
		locale: "id_ID",
	},
	twitter: {
		card: "summary_large_image",
		title: "Rakta.js — Ultra-Fast Frontend Framework",
		description:
			"Unifying App Routing, Auto Import, Type-Safe RPC & built-in Auth into one blazing-fast ecosystem. By Rhein Sullivan.",
		creator: "@RheinSullivan",
	},
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			maxVideoPreview: -1,
			maxImagePreview: "large",
			maxSnippet: -1,
		},
	},
	jsonLd: {
		"@context": "https://schema.org",
		"@type": "SoftwareApplication",
		name: "Rakta.js",
		applicationCategory: "DeveloperApplication",
		operatingSystem: "Cross-platform",
		author: {
			"@type": "Person",
			name: "Muhammad Rizky Ramadhan",
			alternateName: ["Rhein Sullivan", "Vyagra Nexus"],
			address: {
				"@type": "PostalAddress",
				addressLocality: "Cirebon & Jakarta Selatan",
				addressCountry: "Indonesia",
			},
		},
	},
};

export default function RootLayout({ children }: { children: ReactNode }) {
	const titleStr =
		typeof metadata.title === "object" && metadata.title !== null
			? (metadata.title as { default: string }).default
			: (metadata.title as string);
	const descriptionStr = metadata.description ?? "";
	const keywordsStr = Array.isArray(metadata.keywords)
		? metadata.keywords.join(", ")
		: (metadata.keywords ?? "");

	return (
		<html lang="id">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<title>{titleStr}</title>
				<meta name="description" content={descriptionStr} />
				<meta name="keywords" content={keywordsStr} />
				<meta name="author" content={metadata.creator ?? ""} />
				<meta name="application-name" content={metadata.applicationName} />
				<meta property="og:title" content={metadata.openGraph?.title ?? titleStr} />
				<meta property="og:description" content={metadata.openGraph?.description ?? descriptionStr} />
				<meta property="og:type" content={metadata.openGraph?.type ?? "website"} />
				<meta property="og:site_name" content={metadata.openGraph?.siteName ?? "Rakta.js"} />
				<meta property="og:locale" content={metadata.openGraph?.locale ?? "id_ID"} />
				<meta name="twitter:card" content={metadata.twitter?.card ?? "summary_large_image"} />
				<meta name="twitter:title" content={metadata.twitter?.title ?? titleStr} />
				<meta name="twitter:description" content={metadata.twitter?.description ?? descriptionStr} />
				<meta name="twitter:creator" content={metadata.twitter?.creator ?? ""} />
				<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{
						__html: JSON.stringify(metadata.jsonLd),
					}}
				/>
			</head>
			<body className="min-h-screen bg-black text-white antialiased">
				<RaktaToast position="top-right" />
				{children}
			</body>
		</html>
	);
}
