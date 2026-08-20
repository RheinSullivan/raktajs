import { describe, expect, test } from "bun:test";
import { Click, Form, Guard, Lazy, Pantura, Picture, Reborns, Seal, Shelf, Title } from "./index";

describe("Rakta Custom Tag Primitives - Exactly 10 Official Primitives", () => {
	test("1. Click primitive is defined", () => {
		expect(typeof Click).toBe("function");
	});

	test("2. Picture primitive is defined", () => {
		expect(typeof Picture).toBe("function");
	});

	test("3. Pantura primitive is defined", () => {
		expect(typeof Pantura).toBe("function");
	});

	test("4. Reborns primitive is defined", () => {
		expect(typeof Reborns).toBe("function");
	});

	test("5. Lazy primitive is defined", () => {
		expect(typeof Lazy).toBe("function");
	});

	test("6. Guard primitive is defined", () => {
		expect(typeof Guard).toBe("function");
	});

	test("7. Seal error boundary primitive is defined", () => {
		expect(typeof Seal).toBe("function");
	});

	test("8. Form auto-CSRF primitive is defined", () => {
		expect(typeof Form).toBe("function");
	});

	test("9. Title document metadata primitive is defined", () => {
		expect(typeof Title).toBe("function");
	});

	test("10. Shelf state persistence primitive is defined", () => {
		expect(typeof Shelf).toBe("function");
	});
});
