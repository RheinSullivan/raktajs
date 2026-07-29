import { describe, expect, test } from "bun:test";
import {
	createMagicLinkEmail,
	generateBackupCodes,
	generateMagicLinkToken,
	generateTotpSecret,
	generateTotpUri,
	verifyBackupCode,
	verifyMagicLinkToken,
	verifyTotp,
} from "./index";

describe("Rakta Auth - magic links", () => {
	test("generates and verifies a magic link token", async () => {
		const secret = "test-secret-key-32-characters!!";
		const token = await generateMagicLinkToken("user@example.com", secret, 300);

		expect(typeof token).toBe("string");
		expect(token.includes(".")).toBe(true);

		const payload = await verifyMagicLinkToken(token, secret);
		expect(payload).toBeDefined();
		expect(payload?.email).toBe("user@example.com");
	});

	test("rejects tampered magic link token", async () => {
		const secret = "test-secret-key-32-characters!!";
		const token = await generateMagicLinkToken("user@example.com", secret, 300);
		const tampered = `${token}xyz`;

		const result = await verifyMagicLinkToken(tampered, secret);
		expect(result).toBeUndefined();
	});

	test("rejects magic link with wrong secret", async () => {
		const token = await generateMagicLinkToken(
			"user@example.com",
			"correct-secret",
			300,
		);
		const result = await verifyMagicLinkToken(token, "wrong-secret");
		expect(result).toBeUndefined();
	});

	test("createMagicLinkEmail returns subject, text, and html", () => {
		const email = createMagicLinkEmail(
			"user@example.com",
			"token123",
			"https://myapp.com",
		);

		expect(email.subject).toBeTruthy();
		expect(email.text).toContain("https://myapp.com/auth/magic");
		expect(email.html).toContain("token123");
		expect(email.html).toContain("user@example.com");
	});
});

describe("Rakta Auth - TOTP 2FA", () => {
	test("generates a valid base32 TOTP secret", () => {
		const secret = generateTotpSecret();
		expect(typeof secret).toBe("string");
		expect(secret.length).toBeGreaterThan(0);
		// base32: only A-Z and 2-7
		expect(/^[A-Z2-7]+$/.test(secret)).toBe(true);
	});

	test("generates a valid TOTP URI", () => {
		const secret = generateTotpSecret();
		const uri = generateTotpUri(secret, "user@example.com", "MyApp");

		expect(uri.startsWith("otpauth://totp/")).toBe(true);
		expect(uri).toContain("MyApp");
		expect(uri).toContain("user%40example.com");
		expect(uri).toContain(`secret=${secret}`);
	});

	test("verifyTotp rejects invalid token format", async () => {
		const secret = generateTotpSecret();
		expect(await verifyTotp("invalid", secret)).toBe(false);
		expect(await verifyTotp("12345", secret)).toBe(false);
		expect(await verifyTotp("1234567", secret)).toBe(false);
	});

	test("generates and verifies backup codes", () => {
		const codes = generateBackupCodes(5);
		expect(codes).toHaveLength(5);

		for (const code of codes) {
			expect(code).toMatch(/^[A-Z0-9]{4}-[A-Z0-9]{4}$/);
		}

		const firstCode = codes[0];
		expect(firstCode).toBeDefined();
		if (firstCode) {
			expect(verifyBackupCode(firstCode, codes)).toBe(true);
			expect(verifyBackupCode(firstCode.toLowerCase(), codes)).toBe(true);
		}
		expect(verifyBackupCode("XXXX-YYYY", codes)).toBe(false);
	});
});
