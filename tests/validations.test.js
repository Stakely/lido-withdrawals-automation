/* eslint-disable no-undef */
const fs = require("fs");
const {
	percentageValidation,
	urlValidation,
	outputFolderValidation,
	operatorIdValidation,
	passwordValidation,
	moduleIdValidation,
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
});


describe("moduleIdValidation", () => {
	test("should return true for non-empty module IDs", () => {
		expect(moduleIdValidation("module123")).toBe(true);
	});
    
	test("should return error message for empty module IDs", () =>{
		expect(moduleIdValidation("")).toBe("The module ID cannot be empty.");
	});
});
