const fs = require("fs");
const {
	percentageValidation,
	urlValidation,
	outputFolderValidation,
	operatorIdValidation,
	passwordValidation,
	moduleIdValidation,
	missingKeysToleranceValidation,
	withdrawalsScopeValidation,
} = require("../src/utils/validations.js");

jest.mock("fs");

describe("percentageValidation", () => {
	test("should return true for valid percentages", () => {
		expect(percentageValidation("1")).toBe(true);
		expect(percentageValidation("100")).toBe(true);
	});
    
	test("should return error message for invalid percentages", () => {
		expect(percentageValidation("0")).toBe("Invalid percentage. Please enter a value between 1 and 100.");
		expect(percentageValidation("101")).toBe("Invalid percentage. Please enter a value between 1 and 100.");
	});
});

describe("urlValidation", () => {
	test("should return true for valid URLs", () => {
		expect(urlValidation("https:/.example.com")).toBe(true);
		expect(urlValidation("http://example.com:8888")).toBe(true);
	});
    
	test("should return error message for invalid URLs", () => {
		expect(urlValidation("invalid_url")).toBe("Invalid URL. Please enter a valid URL.");
		expect(urlValidation("www.example.com")).toBe("Invalid URL. Please enter a valid URL.");
	});
});

describe("outputFolderValidation", () => {
	test("should return true for existing folder paths", () => {
		fs.existsSync.mockReturnValue(true);
		expect(outputFolderValidation("/valid/folder/path")).toBe(true);
	});
    
	test("should return error message for non-existing folder paths", () => {
		fs.existsSync.mockReturnValue(false);
		expect(outputFolderValidation("/invalid/folder/path")).toBe("Output folder not found. Please enter a valid folder path.");
	});
});

describe("operatorIdValidation", () => {
	test("should return true for valid operator IDs", () => {
		expect(operatorIdValidation("1")).toBe(true);
		expect(operatorIdValidation("100")).toBe(true);
	});
    
	test("should return error message for invalid operator IDs", () => {
		expect(operatorIdValidation("0")).toBe("Please enter a valid integer greater than 0 for the operator ID.");
		expect(operatorIdValidation("-1")).toBe("Please enter a valid integer greater than 0 for the operator ID.");
		expect(operatorIdValidation("1.5")).toBe("Please enter a valid integer greater than 0 for the operator ID.");
	});
});

describe("passwordValidation", () => {
	test("should return true for non-empty passwords", () => {
		expect(passwordValidation("password123")).toBe(true);
	});
    
	test("should return error message for empty passwords", () => {
		expect(passwordValidation("")).toBe("The password cannot be empty.");
	});

	test("should return error message for null passwords", () => {
		expect(passwordValidation(null)).toBe("The password cannot be empty.");
	});

});


describe("moduleIdValidation", () => {
	test("should return true for non-empty module IDs", () => {
		expect(moduleIdValidation("module123")).toBe(true);
	});
    
	test("should return error message for empty module IDs", () =>{
		expect(moduleIdValidation("")).toBe("The module ID cannot be empty.");
	});
});

describe("missingKeysToleranceValidation", () => {
	test("should return true for valid missing keys tolerance values", () => {
		expect(missingKeysToleranceValidation("0")).toBe(true);
		expect(missingKeysToleranceValidation("1")).toBe(true);
		expect(missingKeysToleranceValidation("100")).toBe(true);
		expect(missingKeysToleranceValidation("999")).toBe(true);
	});
    
	test("should return error message for invalid missing keys tolerance values", () => {
		expect(missingKeysToleranceValidation("-1")).toBe("Please enter a valid integer greater than or equal to 0 for the missing keys tolerance.");
		expect(missingKeysToleranceValidation("-10")).toBe("Please enter a valid integer greater than or equal to 0 for the missing keys tolerance.");
		expect(missingKeysToleranceValidation("abc")).toBe("Please enter a valid integer greater than or equal to 0 for the missing keys tolerance.");
		expect(missingKeysToleranceValidation("1.5")).toBe("Please enter a valid integer greater than or equal to 0 for the missing keys tolerance.");
		expect(missingKeysToleranceValidation("10.0")).toBe("Please enter a valid integer greater than or equal to 0 for the missing keys tolerance.");
	});
});

describe("withdrawalsScopeValidation", () => {
	test("should return true for a valid scope", () => {
		expect(withdrawalsScopeValidation("{\"1\":[{\"id\":123,\"percent\":50}]}")).toBe(true);
	});

	test("should return true for multiple modules and operators", () => {
		expect(withdrawalsScopeValidation("{\"1\":[{\"id\":123,\"percent\":50}],\"4\":[{\"id\":0,\"percent\":10},{\"id\":1,\"percent\":100}]}")).toBe(true);
	});

	test("should allow operator id 0", () => {
		expect(withdrawalsScopeValidation("{\"1\":[{\"id\":0,\"percent\":10}]}")).toBe(true);
	});

	test("should return error message for invalid JSON", () => {
		expect(withdrawalsScopeValidation("{\"1\":[")).toBe("WITHDRAWALS_SCOPE is not valid JSON. Expected format: {\"1\":[{\"id\":123,\"percent\":50}]}.");
		expect(withdrawalsScopeValidation("not json")).toBe("WITHDRAWALS_SCOPE is not valid JSON. Expected format: {\"1\":[{\"id\":123,\"percent\":50}]}.");
	});

	test("should return error message when not a plain object", () => {
		const error = "WITHDRAWALS_SCOPE must be a JSON object mapping staking module IDs to operator arrays.";
		expect(withdrawalsScopeValidation("[1,2]")).toBe(error);
		expect(withdrawalsScopeValidation("\"5\"")).toBe(error);
		expect(withdrawalsScopeValidation("null")).toBe(error);
	});

	test("should return error message for an empty object", () => {
		expect(withdrawalsScopeValidation("{}")).toBe("WITHDRAWALS_SCOPE cannot be empty. Define at least one staking module with one operator.");
	});

	test("should return error message for an empty module ID key", () => {
		expect(withdrawalsScopeValidation("{\"\":[{\"id\":1,\"percent\":10}]}")).toBe("WITHDRAWALS_SCOPE staking module ID cannot be empty.");
	});

	test("should return error message when a module does not map to a non-empty array", () => {
		expect(withdrawalsScopeValidation("{\"1\":5}")).toBe("Module 1 must map to a non-empty array of operators.");
		expect(withdrawalsScopeValidation("{\"1\":[]}")).toBe("Module 1 must map to a non-empty array of operators.");
	});

	test("should return error message when an operator is not an object", () => {
		expect(withdrawalsScopeValidation("{\"1\":[123]}")).toBe("Each operator in module 1 must be an object with \"id\" and \"percent\".");
	});

	test("should return error message for an invalid operator id", () => {
		expect(withdrawalsScopeValidation("{\"1\":[{\"id\":1.5,\"percent\":10}]}")).toBe("Operator id 1.5 in module 1 must be an integer greater than or equal to 0.");
		expect(withdrawalsScopeValidation("{\"1\":[{\"id\":-1,\"percent\":10}]}")).toBe("Operator id -1 in module 1 must be an integer greater than or equal to 0.");
		expect(withdrawalsScopeValidation("{\"1\":[{\"id\":\"a\",\"percent\":10}]}")).toBe("Operator id a in module 1 must be an integer greater than or equal to 0.");
		expect(withdrawalsScopeValidation("{\"1\":[{\"percent\":10}]}")).toBe("Operator id undefined in module 1 must be an integer greater than or equal to 0.");
	});

	test("should return error message for an invalid percent", () => {
		expect(withdrawalsScopeValidation("{\"1\":[{\"id\":1,\"percent\":0}]}")).toBe("percent 0 for operator 1 in module 1 must be an integer between 1 and 100.");
		expect(withdrawalsScopeValidation("{\"1\":[{\"id\":1,\"percent\":101}]}")).toBe("percent 101 for operator 1 in module 1 must be an integer between 1 and 100.");
		expect(withdrawalsScopeValidation("{\"1\":[{\"id\":1,\"percent\":50.5}]}")).toBe("percent 50.5 for operator 1 in module 1 must be an integer between 1 and 100.");
		expect(withdrawalsScopeValidation("{\"1\":[{\"id\":1,\"percent\":\"x\"}]}")).toBe("percent x for operator 1 in module 1 must be an integer between 1 and 100.");
		expect(withdrawalsScopeValidation("{\"1\":[{\"id\":1}]}")).toBe("percent undefined for operator 1 in module 1 must be an integer between 1 and 100.");
	});

	test("should return error message for a duplicated operator id in a module", () => {
		expect(withdrawalsScopeValidation("{\"1\":[{\"id\":1,\"percent\":10},{\"id\":1,\"percent\":20}]}")).toBe("Operator id 1 is duplicated in module 1.");
	});
});
