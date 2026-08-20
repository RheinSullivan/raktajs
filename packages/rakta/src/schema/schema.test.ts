import { describe, expect, test } from "bun:test";
import { array } from "./array";
import { boolean } from "./boolean";
import { RaktaSchemaError } from "./errors";
import { number } from "./number";
import { object } from "./object";
import { string } from "./string";

describe("Rakta Schema Engine", () => {
	// -------------- string() --------------
	test("string validates a plain string", () => {
		expect(string().safeParse("hello").kind).toBe("success");
	});

	test("string rejects non-string", () => {
		const result = string().safeParse(42);
		expect(result.kind).toBe("failure");
		if (result.kind === "failure") {
			expect(result.errors[0]?.code).toBe("invalid_type");
		}
	});

	test("string.min enforces minimum length", () => {
		const schema = string().min(5);
		expect(schema.safeParse("hello").kind).toBe("success");
		const fail = schema.safeParse("hi");
		expect(fail.kind).toBe("failure");
		if (fail.kind === "failure") {
			expect(fail.errors[0]?.code).toBe("too_small");
		}
	});

	test("string.max enforces maximum length", () => {
		const schema = string().max(3);
		expect(schema.safeParse("ok").kind).toBe("success");
		const fail = schema.safeParse("toolong");
		expect(fail.kind).toBe("failure");
	});

	test("string.email validates email format", () => {
		expect(string().email().safeParse("user@example.com").kind).toBe("success");
		const fail = string().email().safeParse("not-an-email");
		expect(fail.kind).toBe("failure");
		if (fail.kind === "failure") {
			expect(fail.errors[0]?.code).toBe("invalid_email");
		}
	});

	test("string.url validates https and http URLs", () => {
		expect(string().url().safeParse("https://rakta.dev").kind).toBe("success");
		expect(string().url().safeParse("http://localhost:3000").kind).toBe(
			"success",
		);
	});

	test("string.url rejects ftp, data and bare hostnames", () => {
		expect(string().url().safeParse("ftp://example.com").kind).toBe("failure");
		expect(string().url().safeParse("data:text/plain,hello").kind).toBe(
			"failure",
		);
		expect(string().url().safeParse("notaurl").kind).toBe("failure");
	});

	test("string.nonempty enforces at least one character", () => {
		expect(string().nonempty().safeParse("a").kind).toBe("success");
		expect(string().nonempty().safeParse("").kind).toBe("failure");
	});

	test("string.regex enforces pattern match", () => {
		const schema = string().regex(/^[a-z]+$/, "lowercase only");
		expect(schema.safeParse("hello").kind).toBe("success");
		const fail = schema.safeParse("Hello123");
		expect(fail.kind).toBe("failure");
		if (fail.kind === "failure") {
			expect(fail.errors[0]?.message).toBe("lowercase only");
		}
	});

	test("string.optional() accepts undefined", () => {
		const schema = string().optional();
		expect(schema.safeParse(undefined).kind).toBe("success");
		expect(schema.safeParse("value").kind).toBe("success");
		expect(schema.safeParse(42).kind).toBe("failure");
	});

	// -------------- number() --------------
	test("number validates a plain number", () => {
		expect(number().safeParse(42).kind).toBe("success");
	});

	test("number rejects NaN", () => {
		const result = number().safeParse(Number.NaN);
		expect(result.kind).toBe("failure");
	});

	test("number.int rejects floats", () => {
		expect(number().int().safeParse(3).kind).toBe("success");
		const fail = number().int().safeParse(3.14);
		expect(fail.kind).toBe("failure");
		if (fail.kind === "failure") {
			expect(fail.errors[0]?.code).toBe("not_integer");
		}
	});

	test("number.positive rejects zero and negatives", () => {
		expect(number().positive().safeParse(1).kind).toBe("success");
		expect(number().positive().safeParse(0).kind).toBe("failure");
		expect(number().positive().safeParse(-5).kind).toBe("failure");
	});

	test("number.nonnegative accepts zero", () => {
		expect(number().nonnegative().safeParse(0).kind).toBe("success");
		expect(number().nonnegative().safeParse(-1).kind).toBe("failure");
	});

	// -------------- object() --------------
	test("object validates a shaped object", () => {
		const schema = object({ name: string(), age: number() });
		expect(schema.safeParse({ name: "Rakta", age: 1 }).kind).toBe("success");
	});

	test("object collects field-level errors with correct path", () => {
		const schema = object({ name: string(), age: number() });
		const result = schema.safeParse({ name: "Rakta", age: "not-a-number" });
		expect(result.kind).toBe("failure");
		if (result.kind === "failure") {
			expect(result.errors[0]?.path[0]).toBe("age");
		}
	});

	test("object.extend merges extra fields", () => {
		const base = object({ id: number() });
		const extended = base.extend({ name: string() });
		expect(extended.safeParse({ id: 1, name: "Rakta" }).kind).toBe("success");
	});

	test("object.pick limits to subset of fields", () => {
		const schema = object({
			id: number(),
			name: string(),
			role: string(),
		}).pick(["id", "name"]);
		expect(schema.safeParse({ id: 1, name: "Rakta" }).kind).toBe("success");
	});

	test("object.omit excludes specified fields", () => {
		const schema = object({ id: number(), secret: string() }).omit(["secret"]);
		expect(schema.safeParse({ id: 1 }).kind).toBe("success");
	});

	test("parse() throws RaktaSchemaError on failure", () => {
		expect(() => string().parse(42)).toThrow(RaktaSchemaError);
	});

	// -------------- array() --------------
	test("array validates list of items", () => {
		const schema = array(string());
		expect(schema.safeParse(["a", "b", "c"]).kind).toBe("success");
	});

	test("array reports invalid item index in path", () => {
		const schema = array(number());
		const result = schema.safeParse([1, "bad", 3]);
		expect(result.kind).toBe("failure");
		if (result.kind === "failure") {
			expect(result.errors[0]?.path[0]).toBe("1");
		}
	});

	test("array.min enforces minimum item count", () => {
		expect(array(string()).min(2).safeParse(["a", "b"]).kind).toBe("success");
		expect(array(string()).min(2).safeParse(["a"]).kind).toBe("failure");
	});

	test("array.nonempty rejects empty arrays", () => {
		expect(array(string()).nonempty().safeParse([]).kind).toBe("failure");
	});

	// -------------- boolean() --------------
	test("boolean validates true/false", () => {
		expect(boolean().safeParse(true).kind).toBe("success");
		expect(boolean().safeParse(false).kind).toBe("success");
		expect(boolean().safeParse(0).kind).toBe("failure");
	});
});
