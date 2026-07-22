import { describe, expect, test } from "bun:test";
import {
	createCsrfToken,
	createSecureHeaders,
	decryptCookieValue,
	encryptCookieValue,
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

	test("limits requests and stores secrets", () => {
		const limiter = new RateLimiter();
		const manager = new SecretManager();

		manager.set({ name: "jwt", value: "secret" });

		expect(limiter.check("ip", 1, 1000, 1).allowed).toBe(true);
		expect(limiter.check("ip", 1, 1000, 2).allowed).toBe(false);
		expect(manager.get("jwt")).toBe("secret");
	});
});
