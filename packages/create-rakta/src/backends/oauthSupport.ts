import type { OAuthProvider, ProjectConfig } from "../types";

const OAUTH_AUTHORIZE_ENDPOINTS: Record<string, string> = {
	google: "https://accounts.google.com/o/oauth2/v2/auth",
	github: "https://github.com/login/oauth/authorize",
	apple: "https://appleid.apple.com/auth/authorize",
	microsoft: "https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
	discord: "https://discord.com/oauth2/authorize",
	gitlab: "https://gitlab.com/oauth/authorize",
	facebook: "https://www.facebook.com/v19.0/dialog/oauth",
	custom: "CUSTOM_AUTHORIZE_URL",
};

const OAUTH_TOKEN_ENDPOINTS: Record<string, string> = {
	google: "https://oauth2.googleapis.com/token",
	github: "https://github.com/login/oauth/access_token",
	apple: "https://appleid.apple.com/auth/token",
	microsoft: "https://login.microsoftonline.com/common/oauth2/v2.0/token",
	discord: "https://discord.com/api/oauth2/token",
	gitlab: "https://gitlab.com/oauth/token",
	facebook: "https://graph.facebook.com/v19.0/oauth/access_token",
	custom: "CUSTOM_TOKEN_URL",
};

const OAUTH_SCOPES: Record<string, string> = {
	google: "openid profile email",
	github: "read:user user:email",
	apple: "name email",
	microsoft: "user.read openid profile email",
	discord: "identify email",
	gitlab: "read_user",
	facebook: "email public_profile",
	custom: "openid profile email",
};

export function getOAuthProviders(
	config: Pick<ProjectConfig, "oauthProviders">,
): OAuthProvider[] {
	const providers = config.oauthProviders ?? ["none"];
	return providers.filter((provider) => provider !== "none");
}

export function hasOAuth(
	config: Pick<ProjectConfig, "oauthProviders">,
): boolean {
	return getOAuthProviders(config).length > 0;
}

export function providerLabel(provider: OAuthProvider): string {
	const labels: Record<string, string> = {
		google: "Google",
		github: "GitHub",
		apple: "Apple",
		microsoft: "Microsoft",
		discord: "Discord",
		gitlab: "GitLab",
		facebook: "Facebook",
		custom: "Custom",
	};
	return labels[provider] ?? provider;
}

export function buildOAuthEnvLines(
	providers: readonly OAuthProvider[],
	baseUrl = "http://localhost:4000",
): string {
	if (providers.length === 0) {
		return "";
	}

	return `OAUTH_REDIRECT_BASE_URL=${baseUrl}\n${providers
		.map((provider) => {
			const upperProvider = provider.toUpperCase();
			return `# ${providerLabel(provider)} OAuth
${upperProvider}_CLIENT_ID=
${upperProvider}_CLIENT_SECRET=
${upperProvider}_REDIRECT_URI=${baseUrl}/api/auth/oauth/${provider}/callback`;
		})
		.join("\n")}
`;
}

export function buildAuthorizeUrlExpression(provider: OAuthProvider): string {
	const upperProvider = provider.toUpperCase();
	if (provider === "custom") {
		return `${upperProvider}_CLIENT_ID`;
	}
	return `\`${OAUTH_AUTHORIZE_ENDPOINTS[provider]}?client_id=\${encodeURIComponent(${upperProvider}_CLIENT_ID)}&redirect_uri=\${encodeURIComponent(${upperProvider}_REDIRECT_URI)}&response_type=code&scope=${OAUTH_SCOPES[provider]}\``;
}

export interface OAuthProviderSpec {
	readonly authorize: string;
	readonly token: string;
	readonly scope: string;
}

export function getOAuthProviderSpec(
	provider: OAuthProvider,
): OAuthProviderSpec {
	return {
		authorize: OAUTH_AUTHORIZE_ENDPOINTS[provider] ?? "",
		token: OAUTH_TOKEN_ENDPOINTS[provider] ?? "",
		scope: OAUTH_SCOPES[provider] ?? "",
	};
}

export function buildJsOAuthConfigFile(
	providers: readonly OAuthProvider[],
): string {
	return `export const oauthConfig = {
  providers: ${JSON.stringify(providers)},
  redirectBaseUrl: process.env.OAUTH_REDIRECT_BASE_URL || "http://localhost:4000",
  authorizeEndpoints: {
    google: "https://accounts.google.com/o/oauth2/v2/auth",
    github: "https://github.com/login/oauth/authorize",
    apple: "https://appleid.apple.com/auth/authorize",
    microsoft: "https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
    discord: "https://discord.com/oauth2/authorize",
    gitlab: "https://gitlab.com/oauth/authorize",
    facebook: "https://www.facebook.com/v19.0/dialog/oauth",
    custom: "CUSTOM_AUTHORIZE_URL",
  },
  tokenEndpoints: {
    google: "https://oauth2.googleapis.com/token",
    github: "https://github.com/login/oauth/access_token",
    apple: "https://appleid.apple.com/auth/token",
    microsoft: "https://login.microsoftonline.com/common/oauth2/v2.0/token",
    discord: "https://discord.com/api/oauth2/token",
    gitlab: "https://gitlab.com/oauth/token",
    facebook: "https://graph.facebook.com/v19.0/oauth/access_token",
    custom: "CUSTOM_TOKEN_URL",
  },
  scopes: {
    google: "openid profile email",
    github: "read:user user:email",
    apple: "name email",
    microsoft: "user.read openid profile email",
    discord: "identify email",
    gitlab: "read_user",
    facebook: "email public_profile",
    custom: "openid profile email",
  },
  buildOAuthUrl(provider: string) {
    return \`/api/auth/oauth/\${provider}\`;
  },
  buildRedirectUri(provider: string) {
    return \`\${this.redirectBaseUrl}/api/auth/oauth/\${provider}/callback\`;
  }
};
`;
}

export function buildOAuthEnvExample(
	baseEnvContent: string,
	providers: readonly OAuthProvider[],
	baseUrl = "http://localhost:4000",
): string {
	const oauthEnvLines = buildOAuthEnvLines(providers, baseUrl);
	if (oauthEnvLines.length === 0) {
		return baseEnvContent.endsWith("\n")
			? baseEnvContent
			: `${baseEnvContent}\n`;
	}
	return `${baseEnvContent.endsWith("\n") ? baseEnvContent : `${baseEnvContent}\n`}\n${oauthEnvLines}\n`;
}
