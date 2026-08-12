import { describe, expect, it } from "bun:test";
import {
	buildHtmlEmail,
	buildOptimizedUrl,
	generateBlurPlaceholder,
	generateSrcSet,
	getImageDimensions,
	IMAGE_BREAKPOINTS,
	isAnimatedGif,
	normalizeAddress,
	normalizeAddressList,
	normalizeFormat,
	renderMailTemplate,
	sendMail,
} from "../index";

// ─── Image Tests ─────────────────────────────────────────────────────────────

describe("Rakta @rakta/image", () => {
	it("buildOptimizedUrl passthrough (cdn=none)", () => {
		const url = buildOptimizedUrl({ src: "/hero.jpg" });
		expect(url).toBe("/hero.jpg");
	});

	it("buildOptimizedUrl vercel CDN", () => {
		const url = buildOptimizedUrl({
			src: "/hero.jpg",
			width: 800,
			cdn: "vercel",
		});
		expect(url).toContain("/_next/image");
		expect(url).toContain("w=800");
		expect(url).toContain("q=85");
		expect(url).toContain(encodeURIComponent("/hero.jpg"));
	});

	it("buildOptimizedUrl cloudflare CDN", () => {
		const url = buildOptimizedUrl({
			src: "/hero.jpg",
			width: 1280,
			format: "avif",
			cdn: "cloudflare",
			cdnBase: "https://mysite.com",
		});
		expect(url).toContain("cdn-cgi/image");
		expect(url).toContain("width=1280");
		expect(url).toContain("format=avif");
	});

	it("buildOptimizedUrl imgix CDN", () => {
		const url = buildOptimizedUrl({
			src: "/hero.jpg",
			width: 640,
			cdn: "imgix",
			cdnBase: "https://mysite.imgix.net",
		});
		expect(url).toContain("fm=webp");
		expect(url).toContain("w=640");
	});

	it("generateSrcSet produces entries for each breakpoint", () => {
		const manifest = generateSrcSet({ src: "/banner.jpg", cdn: "none" });
		expect(manifest.srcSet.length).toBe(Object.keys(IMAGE_BREAKPOINTS).length);
		expect(manifest.format).toBe("webp");
		expect(manifest.sizes).toContain("px");
	});

	it("generateBlurPlaceholder returns a data URL and dominant color", () => {
		const result = generateBlurPlaceholder("/hero.jpg");
		expect(result.dataUrl).toMatch(/^data:image\/svg\+xml;base64,/);
		expect(result.dominantColor).toMatch(/^#[0-9a-f]{6}$/i);
	});

	it("generateBlurPlaceholder is deterministic", () => {
		const a = generateBlurPlaceholder("/hero.jpg");
		const b = generateBlurPlaceholder("/hero.jpg");
		expect(a.dominantColor).toBe(b.dominantColor);
	});

	it("getImageDimensions extracts w and h from URL", () => {
		const dims = getImageDimensions("https://cdn.example.com/img?w=800&h=600");
		expect(dims).toEqual({ width: 800, height: 600 });
	});

	it("getImageDimensions returns null for URLs without dimensions", () => {
		expect(getImageDimensions("https://example.com/img.jpg")).toBeNull();
	});

	it("isAnimatedGif detects .gif URLs", () => {
		expect(isAnimatedGif("/anim.gif")).toBe(true);
		expect(isAnimatedGif("/photo.jpg")).toBe(false);
	});

	it("normalizeFormat maps MIME types", () => {
		expect(normalizeFormat("image/webp")).toBe("webp");
		expect(normalizeFormat("image/jpeg")).toBe("jpeg");
		expect(normalizeFormat("jpg")).toBe("jpeg");
		expect(normalizeFormat("avif")).toBe("avif");
	});

	it("quality is clamped to 1–100", () => {
		const lo = buildOptimizedUrl({ src: "/a.jpg", quality: -5, cdn: "vercel" });
		const hi = buildOptimizedUrl({
			src: "/a.jpg",
			quality: 999,
			cdn: "vercel",
		});
		expect(lo).toContain("q=1");
		expect(hi).toContain("q=100");
	});
});

// ─── Mail Tests ───────────────────────────────────────────────────────────────

describe("Rakta @rakta/mail", () => {
	it("normalizeAddress formats display name", () => {
		expect(normalizeAddress({ email: "hi@raktajs.dev", name: "Rhein" })).toBe(
			"Rhein <hi@raktajs.dev>",
		);
	});

	it("normalizeAddress passes string through unchanged", () => {
		expect(normalizeAddress("hi@raktajs.dev")).toBe("hi@raktajs.dev");
	});

	it("normalizeAddressList normalizes a list", () => {
		const result = normalizeAddressList([
			"a@example.com",
			{ email: "b@example.com", name: "B" },
		]);
		expect(result).toEqual(["a@example.com", "B <b@example.com>"]);
	});

	it("renderMailTemplate interpolates variables", () => {
		const out = renderMailTemplate("Hello {{name}}, version {{v}}!", {
			name: "Rhein",
			v: "1.1.4",
		});
		expect(out).toBe("Hello Rhein, version 1.1.4!");
	});

	it("renderMailTemplate leaves unknown placeholders untouched", () => {
		const out = renderMailTemplate("Hi {{name}} {{unknown}}!", {
			name: "Rhein",
		});
		expect(out).toBe("Hi Rhein {{unknown}}!");
	});

	it("buildHtmlEmail wraps content in valid HTML shell", () => {
		const html = buildHtmlEmail("<p>Hello</p>", { title: "Test Mail" });
		expect(html).toContain("<!DOCTYPE html>");
		expect(html).toContain("<p>Hello</p>");
		expect(html).toContain("Test Mail");
		expect(html).toContain("Rakta.js Mail");
	});

	it("console transport sends without error", async () => {
		const result = await sendMail(
			{ driver: "console" },
			{
				from: "noreply@raktajs.dev",
				to: ["test@example.com"],
				subject: "Rakta.js Mail Test",
				text: "Hello from Rakta.js mail system.",
			},
		);
		expect(result.success).toBe(true);
		expect(result.messageId).toMatch(/^console-/);
	});

	it("stub transport returns failure with helpful error", async () => {
		const result = await sendMail(
			{ driver: "resend", apiKey: "re_test_key" },
			{
				from: "noreply@raktajs.dev",
				to: ["test@example.com"],
				subject: "Stub Test",
				text: "stub",
			},
		);
		expect(result.success).toBe(false);
		expect(result.error).toContain("resend");
	});
});
