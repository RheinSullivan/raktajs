import { describe, expect, test } from "bun:test";
import {
	buildCsp,
	createCsrfToken,
	createSecureHeaders,
	decryptCookieValue,
	defaultCsp,
	encryptCookieValue,
	generateCspNonce,
	RateLimiter,
	SecretManager,
	verifyCsrfToken,
} from "./index";

describe("Rakta security helpers", () => {
	test("creates secure headers and csrf tokens", () => {
		const headers = createSecureHeaders();
		const token = createCsrfToken("secret", 1);
		const cookie = encryptCookieValue("session", "secret");

		expect(headers.get("X-Content-Type-Options")).toBe("nosniff");
		expect(verifyCsrfToken(token, "secret")).toBe(true);
		expect(decryptCookieValue(cookie, "secret")).toBe("session");
	});

	test("handles malformed Base64 tokens and cookies gracefully without throwing", () => {
		expect(verifyCsrfToken("invalid-base64-!!!", "secret")).toBe(false);
		expect(decryptCookieValue("invalid-base64-!!!", "secret")).toBeUndefined();
	});

	test("limits requests and stores secrets", () => {
		const limiter = new RateLimiter();
		const manager = new SecretManager();

		manager.set({ name: "jwt", value: "secret" });

		expect(limiter.check("ip", 1, 1000, 1).allowed).toBe(true);
		expect(limiter.check("ip", 1, 1000, 2).allowed).toBe(false);
		expect(manager.get("jwt")).toBe("secret");
	});

	test("builds CSP header and generates nonce", () => {
		const csp = buildCsp({
			defaultSrc: ["'self'"],
			scriptSrc: ["'self'", "'nonce-abc123'"],
			upgradeInsecureRequests: true,
		});

		expect(csp).toContain("default-src 'self'");
		expect(csp).toContain("script-src 'self' 'nonce-abc123'");
		expect(csp).toContain("upgrade-insecure-requests");

		const nonce = generateCspNonce();
		expect(nonce.length).toBeGreaterThan(0);
		// base64url: no +, /, or = chars
		expect(nonce).not.toContain("+");
		expect(nonce).not.toContain("/");

		const fullCsp = defaultCsp(nonce);
		expect(fullCsp).toContain(`nonce-${nonce}`);
	});
});
