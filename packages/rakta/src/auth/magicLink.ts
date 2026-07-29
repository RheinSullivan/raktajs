// RaktaAuth - Magic Link (passwordless) authentication
// Self-hosted, zero external dependencies.

export interface MagicLinkPayload {
	readonly email: string;
	readonly issuedAt: number;
	readonly expiresAt: number;
}

export interface MagicLinkEmail {
	readonly subject: string;
	readonly text: string;
	readonly html: string;
}

/**
 * Generate a magic link token for passwordless authentication.
 * Token is base64url-encoded and HMAC-signed with the app secret.
 *
 * @example
 * const token = await generateMagicLinkToken("user@example.com", process.env.AUTH_SECRET);
 * const magicLink = `https://myapp.com/auth/magic?token=${token}`;
 */
export async function generateMagicLinkToken(
	email: string,
	secret: string,
	expiresInSeconds = 15 * 60, // 15 minutes default
): Promise<string> {
	const issuedAt = Math.floor(Date.now() / 1000);
	const expiresAt = issuedAt + expiresInSeconds;
	const payload: MagicLinkPayload = { email, issuedAt, expiresAt };
	const payloadJson = JSON.stringify(payload);
	const payloadB64 = btoa(payloadJson)
		.replace(/\+/g, "-")
		.replace(/\//g, "_")
		.replace(/=+$/, "");

	const cryptoKey = await crypto.subtle.importKey(
		"raw",
		new TextEncoder().encode(secret),
		{ name: "HMAC", hash: "SHA-256" },
		false,
		["sign"],
	);

	const signatureBuffer = await crypto.subtle.sign(
		"HMAC",
		cryptoKey,
		new TextEncoder().encode(payloadB64),
	);

	const signatureB64 = btoa(
		String.fromCharCode(...new Uint8Array(signatureBuffer)),
	)
		.replace(/\+/g, "-")
		.replace(/\//g, "_")
		.replace(/=+$/, "");

	return `${payloadB64}.${signatureB64}`;
}

/**
 * Verify a magic link token. Returns the payload if valid, undefined otherwise.
 */
export async function verifyMagicLinkToken(
	token: string,
	secret: string,
): Promise<{ email: string } | undefined> {
	const dotIndex = token.lastIndexOf(".");
	if (dotIndex === -1) return undefined;

	const payloadPart = token.slice(0, dotIndex);
	const signaturePart = token.slice(dotIndex + 1);

	const cryptoKey = await crypto.subtle.importKey(
		"raw",
		new TextEncoder().encode(secret),
		{ name: "HMAC", hash: "SHA-256" },
		false,
		["sign"],
	);

	const expectedSignatureBuffer = await crypto.subtle.sign(
		"HMAC",
		cryptoKey,
		new TextEncoder().encode(payloadPart),
	);

	const expectedSignature = btoa(
		String.fromCharCode(...new Uint8Array(expectedSignatureBuffer)),
	)
		.replace(/\+/g, "-")
		.replace(/\//g, "_")
		.replace(/=+$/, "");

	if (signaturePart !== expectedSignature) return undefined;

	try {
		const payloadJson = atob(payloadPart.replace(/-/g, "+").replace(/_/g, "/"));
		const payload = JSON.parse(payloadJson) as MagicLinkPayload;
		const now = Math.floor(Date.now() / 1000);

		if (payload.expiresAt < now) return undefined;

		return { email: payload.email };
	} catch {
		return undefined;
	}
}

/**
 * Create a magic link email object (subject + text + HTML).
 * Replace the template with your own branding as needed.
 */
export function createMagicLinkEmail(
	email: string,
	token: string,
	baseUrl: string,
): MagicLinkEmail {
	const magicUrl = `${baseUrl.replace(/\/$/, "")}/auth/magic?token=${encodeURIComponent(token)}`;

	return {
		subject: "Your sign-in link",
		text: `Hi,\n\nClick the link below to sign in to your account. The link expires in 15 minutes.\n\n${magicUrl}\n\nIf you did not request this, please ignore this email.\n`,
		html: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/></head>
<body style="font-family:system-ui,sans-serif;background:#000;color:#fff;padding:32px;">
  <h1 style="font-size:20px;font-weight:bold;margin-bottom:8px;">Sign in to your account</h1>
  <p style="color:#a1a1aa;margin-bottom:24px;">Click the button below. The link expires in 15 minutes.</p>
  <a href="${magicUrl}" style="display:inline-block;background:#e11d48;color:#fff;padding:12px 24px;text-decoration:none;font-weight:bold;border-radius:0;">
    Sign in
  </a>
  <p style="color:#52525b;margin-top:24px;font-size:12px;">
    Or copy this URL: <a href="${magicUrl}" style="color:#e11d48;">${magicUrl}</a>
  </p>
  <p style="color:#52525b;font-size:12px;">
    Request for: <strong>${email}</strong>. If you did not request this, ignore this email.
  </p>
</body>
</html>`,
	};
}
