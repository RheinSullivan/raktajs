import type React from "react";
import "../styles/globals.css";

interface RootLayoutProps {
	readonly children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
	return (
		<html lang="en">
			<head>
				<meta charSet="UTF-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<title>Rakta.js App</title>
			</head>
			<body>{children}</body>
		</html>
	);
}
