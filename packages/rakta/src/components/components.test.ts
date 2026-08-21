import { describe, expect, test } from "bun:test";
import {
	Click,
	Form,
	Guard,
	Island,
	Lazy,
	Pantura,
	Picture,
	Prefetch,
	RAKTA_EXCLUDED_COMPAT_TAGS,
	RAKTA_OFFICIAL_CUSTOM_TAGS,
	Reborns,
	Resource,
	Route,
	Seal,
	Shelf,
	Title,
} from "./index";

describe("Rakta custom tag inventory", () => {
	test("declares exactly 10 official custom tags", () => {
		expect(RAKTA_OFFICIAL_CUSTOM_TAGS).toEqual([
			"click",
			"picture",
			"lazy",
			"guard",
			"seal",
			"shelf",
			"island",
			"prefetch",
			"route",
			"resource",
		]);
		expect(RAKTA_OFFICIAL_CUSTOM_TAGS).toHaveLength(10);
	});

	test("preserves excluded compatibility tags outside the official count", () => {
		expect(RAKTA_EXCLUDED_COMPAT_TAGS).toEqual([
			"pantura",
			"reborns",
			"form",
			"title",
		]);
		expect(RAKTA_EXCLUDED_COMPAT_TAGS).toHaveLength(4);
	});

	test("official primitive implementations are defined", () => {
		expect(typeof Click).toBe("function");
		expect(typeof Picture).toBe("function");
		expect(typeof Lazy).toBe("function");
		expect(typeof Guard).toBe("function");
		expect(typeof Seal).toBe("function");
		expect(typeof Shelf).toBe("function");
		expect(typeof Island).toBe("function");
		expect(typeof Prefetch).toBe("function");
		expect(typeof Route).toBe("function");
		expect(typeof Resource).toBe("function");
	});

	test("excluded compatibility primitive implementations are preserved", () => {
		expect(typeof Pantura).toBe("function");
		expect(typeof Reborns).toBe("function");
		expect(typeof Form).toBe("function");
		expect(typeof Title).toBe("function");
	});
});
