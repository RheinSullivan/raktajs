interface RootLayoutProps {
	readonly children: import("react").ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
	return (
		<html lang="en">
			<head>
				<meta charSet="UTF-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<title>Rakta.js App</title>
			</head>
			<body className="min-h-screen bg-[#050505] text-slate-50 antialiased">
				{children}
			</body>
		</html>
	);
}
