interface RootLayoutProps {
	readonly children: import("react").ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
	return (
		<html lang="en">
			<head>
				<meta charSet="UTF-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<meta
					name="description"
					content="Built with Rakta.js — Small in size. Fierce in speed. Alive in every route."
				/>
				<title>
					Rakta.js | Small in size. Fierce in speed. Alive in every route
				</title>
				<link
					rel="icon"
					href="/favicon.ico?v=rakta"
					sizes="any"
					type="image/x-icon"
				/>
				<link
					rel="shortcut icon"
					href="/favicon.ico?v=rakta"
					type="image/x-icon"
				/>
				<link rel="apple-touch-icon" href="/favicon.ico?v=rakta" />
			</head>
			<body className="min-h-screen bg-[#050505] text-slate-50 antialiased">
				{children}
			</body>
		</html>
	);
}
