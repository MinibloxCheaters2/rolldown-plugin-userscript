import { parse } from "oxc-parser";
import { describe, expect, it } from "vitest";
import { collectGrants, getMetadata } from "../src/util";

describe("collectGrants", () => {
	const parseCode = async (code: string) => {
		return (await parse("file", code)).program;
	};

	it("should return an empty set on an empty input", async () => {
		const astNode = await parseCode(``);
		const result = collectGrants(astNode);

		expect(result.size).toBe(0);
	});

	it("should return only GM_dummyApi", async () => {
		const astNode = await parseCode(`GM_dummyApi`);
		const result = collectGrants(astNode);

		expect(result.size).toBe(1);
		expect(result).toContain("GM_dummyApi");
	});

	it("should ignore any scope-defined variables that look like GM APIs", async () => {
		const astNode = await parseCode(`
      let GM_dummyApi;
      GM_dummyApi;
    `);
		const result = collectGrants(astNode);

		expect(result.size).toBe(0);
	});

	it("should return only GM.dummyApi", async () => {
		const astNode = await parseCode(`GM.dummyApi`);
		const result = collectGrants(astNode);

		expect(result.size).toBe(1);
		expect(result).toContain("GM.dummyApi");
	});

	it("should return unsafeWindow when presented with just unsafeWindow", async () => {
		const astNode = await parseCode(`unsafeWindow`);
		const result = collectGrants(astNode);

		expect(result.size).toBe(1);
		expect(result).toContain("unsafeWindow");
	});

	it("should return nothing unsafeWindow when presented with unsafeWindowButNotReally", async () => {
		const astNode = await parseCode(`unsafeWindowButNotReally`);
		const result = collectGrants(astNode);

		expect(result.size).toBe(0);
	});

	it("should return unsafeWindow even when a subfield is accessed", async () => {
		const astNode = await parseCode(`unsafeWindow.anotherThing`);
		const result = collectGrants(astNode);

		expect(result.size).toBe(1);
		expect(result).toContain("unsafeWindow");
	});

	it("should return unsafeWindow even when a subfield is accessed with object notation", async () => {
		const astNode = await parseCode(`unsafeWindow["anotherThing"]`);
		const result = collectGrants(astNode);

		expect(result.size).toBe(1);
		expect(result).toContain("unsafeWindow");
	});
});

describe("getMetadata", () => {
	it("should throw error on an empty input", () => {
		expect(() => getMetadata("", new Set())).toThrow(Error);
	});
});
