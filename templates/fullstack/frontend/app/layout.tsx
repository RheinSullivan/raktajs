const SITE_URL = "https://raktajs.dev";
const OG_IMAGE = `${SITE_URL}/og/rakta-banner.png`;

export const metadata: Metadata = {
	metadataBase: SITE_URL,
	title: {
		default: "Rakta.js, Ultra-Fast Fullstack Framework | Cirebon · Nusantara",
		template: "%s | Rakta.js",
	},
	description:
		"Rakta.js is a lightweight fullstack React framework by Muhammad Rizky Ramadhan (Rhein Sullivan / Vyagra Nexus™) from Cirebon & South Jakarta, Indonesia. File-based App Routing, zero-import Auto Import, end-to-end Type-Safe RPC, integrated frontend-backend monolith, and built-in Authentication, all in one Bun + TypeScript ecosystem.",
	keywords: [
		"Rakta.js",
		"Framework Frontend",
		"React Framework",
		"Javascript Frontend Framework",
		"Indonesia Developer",
		"Rhein Sullivan",
		"Muhammad Rizky Ramadhan",
		"Vyagra Nexus",
		"Cirebon",
		"Jakarta Selatan",
		"Nusantara",
		"Auto Import",
		"Type-Safe RPC",
		"Bun Framework",
		"TypeScript Framework",
		"Fullstack React",
		"Indonesian JavaScript Framework",
		"Monolith Frontend Backend",
	],
	authors: [
		{
			name: "Muhammad Rizky Ramadhan",
			url: "https://github.com/RheinSullivan",
		},
	],
	creator: "Rhein Sullivan",
	publisher: "Vyagra Nexus™",
	applicationName: "Rakta.js",
	themeColor: "#000000",
	colorScheme: "dark",
	formatDetection: {
		email: false,
		address: false,
		telephone: false,
	},
	canonical: SITE_URL,
	alternates: {
		canonical: SITE_URL,
		languages: {
			"id-ID": SITE_URL,
			"en-US": SITE_URL,
		},
	},
	openGraph: {
		type: "website",
		url: SITE_URL,
		title: "Rakta.js, Ultra-Fast Fullstack Framework | Cirebon · Nusantara",
		description:
			"Lightweight fullstack React framework with zero-import Auto Import, file-based routing, type-safe RPC, and built-in auth. Crafted in Indonesia by Rhein Sullivan.",
		siteName: "Rakta.js",
		locale: "id_ID",
		images: [
			{
				url: OG_IMAGE,
				width: 1200,
				height: 630,
				alt: "Rakta.js, Small in Size. Fierce in Speed. Alive in Every Route.",
				type: "image/png",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		site: "@RheinSullivan",
		creator: "@RheinSullivan",
		title: "Rakta.js, Ultra-Fast Fullstack Framework",
		description:
			"Zero-import Auto Import · File-based Routing · Type-Safe RPC · Built-in Auth. By Rhein Sullivan / Vyagra Nexus™ from Cirebon, Indonesia.",
		image: OG_IMAGE,
		imageAlt: "Rakta.js Framework Banner",
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
	icons: {
		icon: [
			{ url: "/favicon.ico", sizes: "48x48", type: "image/x-icon" },
			{ url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
			{ url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
			{
				url: "/android-chrome-192x192.png",
				sizes: "192x192",
				type: "image/png",
			},
			{
				url: "/android-chrome-512x512.png",
				sizes: "512x512",
				type: "image/png",
			},
			{ url: "/rakta-logo.svg", type: "image/svg+xml" },
		],
		apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
	},
	manifest: "/site.webmanifest",
	other: {
		generator: "Rakta.js",
		"geo.region": "ID-JB",
		"geo.placename": "Cirebon, West Java, Indonesia",
		"geo.position": "-6.7063;108.5570",
		ICBM: "-6.7063, 108.5570",
		language: "Indonesian, English",
		"description:lang:id":
			"Rakta.js, framework React fullstack ringan karya Muhammad Rizky Ramadhan (Rhein Sullivan / Vyagra Nexus™) dari Cirebon & Jakarta Selatan. Menyatukan App Routing berbasis file, Auto Import tanpa pernyataan import manual, Type-Safe RPC, arsitektur monolith frontend-backend, dan autentikasi bawaan dalam satu ekosistem Bun + TypeScript.",
	},
	jsonLd: {
		"@context": "https://schema.org",
		"@graph": [
			{
				"@type": "WebSite",
				"@id": `${SITE_URL}/#website`,
				url: SITE_URL,
				name: "Rakta.js",
				description:
					"Ultra-fast fullstack React framework from Indonesia with zero-import Auto Import, file-based routing, and type-safe RPC.",
				inLanguage: ["id-ID", "en-US"],
				publisher: { "@id": `${SITE_URL}/#organization` },
			},
			{
				"@type": "SoftwareApplication",
				"@id": `${SITE_URL}/#software`,
				name: "Rakta.js",
				applicationCategory: "DeveloperApplication",
				operatingSystem: "Cross-platform",
				description:
					"A lightweight fullstack React framework unifying file-based App Routing, zero-import Auto Import, end-to-end Type-Safe RPC, integrated frontend-backend monolith, and built-in Authentication.",
				url: SITE_URL,
				author: { "@id": `${SITE_URL}/#person` },
				offers: {
					"@type": "Offer",
					price: "0",
					priceCurrency: "USD",
				},
			},
			{
				"@type": "Person",
				"@id": `${SITE_URL}/#person`,
				name: "Muhammad Rizky Ramadhan",
				alternateName: ["Rhein Sullivan", "Vyagra Nexus"],
				jobTitle: "Software Developer",
				nationality: "Indonesian",
				address: {
					"@type": "PostalAddress",
					addressLocality: "Cirebon",
					addressRegion: "West Java",
					addressCountry: "ID",
				},
				sameAs: [
					"https://github.com/RheinSullivan",
					"https://github.com/RheinSullivan/raktajs",
				],
			},
			{
				"@type": "Organization",
				"@id": `${SITE_URL}/#organization`,
				name: "Vyagra Nexus",
				founder: { "@id": `${SITE_URL}/#person` },
				url: SITE_URL,
			},
		],
	},
};

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html lang="id">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				{/* mask-icon untuk Safari pinned tab ,  pakai logo udang Rakta.js */}
				<link rel="mask-icon" href="/rakta-logo.svg" color="#e11d48" />
				<RaktaHead metadata={metadata} />
			</head>
			<body className="min-h-screen bg-black text-white antialiased">
				<RaktaToast position="top-right" />
				{children}
			</body>
		</html>
	);
}
