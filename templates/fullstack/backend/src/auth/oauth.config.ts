// OAuth Provider Configuration
// All providers are optional and self-hosted.
// Configure environment variables for the providers you want to use.
// These providers EXTEND Rakta.js authentication — they do not replace it.

function env(key: string, fallback = ""): string {
	return process.env[key] ?? fallback;
}

export const OAUTH_PROVIDERS = {
	google: {
		clientId: env("GOOGLE_CLIENT_ID"),
		clientSecret: env("GOOGLE_CLIENT_SECRET"),
		redirectUri: env(
			"GOOGLE_REDIRECT_URI",
			"http://localhost:4000/api/auth/callback/google",
		),
		authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
		tokenUrl: "https://oauth2.googleapis.com/token",
		userInfoUrl: "https://www.googleapis.com/oauth2/v3/userinfo",
		scopes: ["openid", "email", "profile"],
	},
	github: {
		clientId: env("GITHUB_CLIENT_ID"),
		clientSecret: env("GITHUB_CLIENT_SECRET"),
		redirectUri: env(
			"GITHUB_REDIRECT_URI",
			"http://localhost:4000/api/auth/callback/github",
		),
		authUrl: "https://github.com/login/oauth/authorize",
		tokenUrl: "https://github.com/login/oauth/access_token",
		userInfoUrl: "https://api.github.com/user",
		scopes: ["read:user", "user:email"],
	},
	apple: {
		clientId: env("APPLE_CLIENT_ID"),
		clientSecret: env("APPLE_CLIENT_SECRET"),
		redirectUri: env(
			"APPLE_REDIRECT_URI",
			"http://localhost:4000/api/auth/callback/apple",
		),
		authUrl: "https://appleid.apple.com/auth/authorize",
		tokenUrl: "https://appleid.apple.com/auth/token",
		scopes: ["name", "email"],
	},
	microsoft: {
		clientId: env("MICROSOFT_CLIENT_ID"),
		clientSecret: env("MICROSOFT_CLIENT_SECRET"),
		redirectUri: env(
			"MICROSOFT_REDIRECT_URI",
			"http://localhost:4000/api/auth/callback/microsoft",
		),
		authUrl:
			"https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
		tokenUrl: "https://login.microsoftonline.com/common/oauth2/v2.0/token",
		userInfoUrl: "https://graph.microsoft.com/v1.0/me",
		scopes: ["openid", "email", "profile"],
	},
	discord: {
		clientId: env("DISCORD_CLIENT_ID"),
		clientSecret: env("DISCORD_CLIENT_SECRET"),
		redirectUri: env(
			"DISCORD_REDIRECT_URI",
			"http://localhost:4000/api/auth/callback/discord",
		),
		authUrl: "https://discord.com/api/oauth2/authorize",
		tokenUrl: "https://discord.com/api/oauth2/token",
		userInfoUrl: "https://discord.com/api/users/@me",
		scopes: ["identify", "email"],
	},
	gitlab: {
		clientId: env("GITLAB_CLIENT_ID"),
		clientSecret: env("GITLAB_CLIENT_SECRET"),
		redirectUri: env(
			"GITLAB_REDIRECT_URI",
			"http://localhost:4000/api/auth/callback/gitlab",
		),
		authUrl: "https://gitlab.com/oauth/authorize",
		tokenUrl: "https://gitlab.com/oauth/token",
		userInfoUrl: "https://gitlab.com/api/v4/user",
		scopes: ["read_user", "email"],
	},
	facebook: {
		clientId: env("FACEBOOK_CLIENT_ID"),
		clientSecret: env("FACEBOOK_CLIENT_SECRET"),
		redirectUri: env(
			"FACEBOOK_REDIRECT_URI",
			"http://localhost:4000/api/auth/callback/facebook",
		),
		authUrl: "https://www.facebook.com/v18.0/dialog/oauth",
		tokenUrl: "https://graph.facebook.com/v18.0/oauth/access_token",
		userInfoUrl: "https://graph.facebook.com/me?fields=id,name,email",
		scopes: ["email", "public_profile"],
	},
} as const;

export type OAuthProviderName = keyof typeof OAUTH_PROVIDERS;

/**
 * Build the OAuth authorization URL for a provider.
 * Redirect the user to this URL to start the OAuth flow.
 */
export function buildOAuthUrl(
	provider: OAuthProviderName,
	state: string,
): string {
	const config = OAUTH_PROVIDERS[provider];
	if (!config.clientId) {
		throw new Error(
			`OAuth provider "${provider}" is not configured. Set the required environment variables.`,
		);
	}

	const params = new URLSearchParams({
		client_id: config.clientId,
		redirect_uri: config.redirectUri,
		response_type: "code",
		scope: (config.scopes as readonly string[]).join(" "),
		state,
	});

	return `${config.authUrl}?${params.toString()}`;
}
