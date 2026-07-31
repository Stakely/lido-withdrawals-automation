const {
	resolveScope,
	buildScopeFromSinglePair,
	expandScope,
} = require("../src/utils/scope.js");

describe("resolveScope", () => {
	test("should parse WITHDRAWALS_SCOPE when no legacy variables are present", () => {
		const scope = resolveScope({
			withdrawalsScope: "{\"1\":[{\"id\":123,\"percent\":50}]}",
			moduleId: undefined,
			operatorId: undefined,
			percentage: undefined,
		});
		expect(scope).toEqual({ "1": [{ id: 123, percent: 50 }] });
	});

	const VALID_SCOPE = "{\"1\":[{\"id\":123,\"percent\":50}]}";

	test("should throw when WITHDRAWALS_SCOPE is combined with MODULE_ID", () => {
		expect(() => resolveScope({
			withdrawalsScope: VALID_SCOPE,
			moduleId: "1",
			operatorId: undefined,
			percentage: undefined,
		})).toThrow(/cannot be combined/);
	});

	test("should throw when WITHDRAWALS_SCOPE is combined with OPERATOR_ID", () => {
		expect(() => resolveScope({
			withdrawalsScope: VALID_SCOPE,
			moduleId: undefined,
			operatorId: "123",
			percentage: undefined,
		})).toThrow(/cannot be combined/);
	});

	test("should throw when WITHDRAWALS_SCOPE is combined with PERCENTAGE", () => {
		expect(() => resolveScope({
			withdrawalsScope: VALID_SCOPE,
			moduleId: undefined,
			operatorId: undefined,
			percentage: "10",
		})).toThrow(/cannot be combined/);
	});

	test("should throw when WITHDRAWALS_SCOPE is combined with the full legacy trio", () => {
		expect(() => resolveScope({
			withdrawalsScope: VALID_SCOPE,
			moduleId: "1",
			operatorId: "123",
			percentage: "10",
		})).toThrow(/cannot be combined/);
	});

	test("should not warn about deprecation when WITHDRAWALS_SCOPE is used", () => {
		const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
		resolveScope({
			withdrawalsScope: VALID_SCOPE,
			moduleId: undefined,
			operatorId: undefined,
			percentage: undefined,
		});
		expect(warnSpy).not.toHaveBeenCalled();
		warnSpy.mockRestore();
	});

	test("should map the deprecated trio to a scope and warn", () => {
		const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});

		const scope = resolveScope({
			withdrawalsScope: undefined,
			moduleId: "1",
			operatorId: "123",
			percentage: "50",
		});

		expect(scope).toEqual({ "1": [{ id: 123, percent: 50 }] });
		expect(warnSpy).toHaveBeenCalledTimes(1);

		warnSpy.mockRestore();
	});

	test("should return null when the legacy trio is incomplete", () => {
		// Only MODULE_ID
		expect(resolveScope({
			withdrawalsScope: undefined,
			moduleId: "1",
			operatorId: undefined,
			percentage: undefined,
		})).toBeNull();

		// Only OPERATOR_ID
		expect(resolveScope({
			withdrawalsScope: undefined,
			moduleId: undefined,
			operatorId: "123",
			percentage: undefined,
		})).toBeNull();

		// MODULE_ID + OPERATOR_ID but missing PERCENTAGE
		expect(resolveScope({
			withdrawalsScope: undefined,
			moduleId: "1",
			operatorId: "123",
			percentage: undefined,
		})).toBeNull();

		// MODULE_ID + PERCENTAGE but missing OPERATOR_ID
		expect(resolveScope({
			withdrawalsScope: undefined,
			moduleId: "1",
			operatorId: undefined,
			percentage: "50",
		})).toBeNull();
	});

	test("should return null when nothing is provided", () => {
		expect(resolveScope({
			withdrawalsScope: undefined,
			moduleId: undefined,
			operatorId: undefined,
			percentage: undefined,
		})).toBeNull();
	});
});

describe("buildScopeFromSinglePair", () => {
	test("should build a single-pair scope with numeric id and percent", () => {
		expect(buildScopeFromSinglePair("1", "123", "50")).toEqual({ "1": [{ id: 123, percent: 50 }] });
	});
});

describe("expandScope", () => {
	test("should flatten the scope into ordered pairs keeping operator 0", () => {
		const scope = {
			"1": [{ id: 123, percent: 50 }],
			"4": [{ id: 0, percent: 10 }, { id: 1, percent: 20 }],
		};
		expect(expandScope(scope)).toEqual([
			{ moduleId: "1", operatorId: 123, percent: 50 },
			{ moduleId: "4", operatorId: 0, percent: 10 },
			{ moduleId: "4", operatorId: 1, percent: 20 },
		]);
	});

	test("should deduplicate identical module/operator pairs keeping the first occurrence", () => {
		const scope = { "1": [{ id: 1, percent: 10 }, { id: 1, percent: 99 }] };
		expect(expandScope(scope)).toEqual([{ moduleId: "1", operatorId: 1, percent: 10 }]);
	});

	test("should return an empty array for an empty scope", () => {
		expect(expandScope({})).toEqual([]);
	});
});
