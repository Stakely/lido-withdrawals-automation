const url = require("url");
const fs = require("fs");

function isValidUrl(inputUrl) {
	try {
		const parsedUrl = new url.URL(inputUrl);
		return ["http:", "https:"].includes(parsedUrl.protocol);
	} catch (error) {
		return false;
	}
}

function percentageValidation(input) {
	const value = parseInt(input, 10);
	return value >= 1 && value <= 100 ? true : "Invalid percentage. Please enter a value between 1 and 100.";
}

function urlValidation(input) {
	return isValidUrl(input) ? true : "Invalid URL. Please enter a valid URL.";
}

function outputFolderValidation(input) {
	return fs.existsSync(input) ? true : "Output folder not found. Please enter a valid folder path.";
}

function operatorIdValidation(value) {
    
	// Don't allow decimal numbers
	if (value.includes(".")) {
		return "Please enter a valid integer greater than 0 for the operator ID.";
	}
    
	const intValue = parseInt(value, 10);
	if (isNaN(intValue) || intValue <= 0) {
		return "Please enter a valid integer greater than 0 for the operator ID.";
	}
	return true;
}

function passwordValidation(value) {
	return (value ?? "").trim() !== "" ? true : "The password cannot be empty.";
}

function moduleIdValidation(value) {
	return value != "" ? true : "The module ID cannot be empty.";
}

function missingKeysToleranceValidation(value) {
	// Don't allow decimal numbers
	if (value.includes(".")) {
		return "Please enter a valid integer greater than or equal to 0 for the missing keys tolerance.";
	}
    
	const intValue = parseInt(value, 10);
	if (isNaN(intValue) || intValue < 0) {
		return "Please enter a valid integer greater than or equal to 0 for the missing keys tolerance.";
	}
	return true;
}

function booleanValidation(value) {
	return value === "true" || value === "false" ? true : "Please enter a valid boolean value (true or false).";
}

function withdrawalsScopeValidation(value) {
	let scope;
	try {
		scope = JSON.parse(value);
	} catch (error) {
		return "WITHDRAWALS_SCOPE is not valid JSON. Expected format: {\"1\":[{\"id\":123,\"percent\":50}]}.";
	}

	if (typeof scope !== "object" || scope === null || Array.isArray(scope)) {
		return "WITHDRAWALS_SCOPE must be a JSON object mapping staking module IDs to operator arrays.";
	}

	const moduleIds = Object.keys(scope);
	if (moduleIds.length === 0) {
		return "WITHDRAWALS_SCOPE cannot be empty. Define at least one staking module with one operator.";
	}

	for (const moduleId of moduleIds) {
		if (moduleIdValidation(moduleId) !== true) {
			return "WITHDRAWALS_SCOPE staking module ID cannot be empty.";
		}

		const operators = scope[moduleId];
		if (!Array.isArray(operators) || operators.length === 0) {
			return `Module ${moduleId} must map to a non-empty array of operators.`;
		}

		const seenOperatorIds = new Set();
		for (const operator of operators) {
			if (typeof operator !== "object" || operator === null || Array.isArray(operator)) {
				return `Each operator in module ${moduleId} must be an object with "id" and "percent".`;
			}

			if (!Number.isInteger(operator.id) || operator.id < 0) {
				return `Operator id ${operator.id} in module ${moduleId} must be an integer greater than or equal to 0.`;
			}

			if (!Number.isInteger(operator.percent) || operator.percent < 1 || operator.percent > 100) {
				return `percent ${operator.percent} for operator ${operator.id} in module ${moduleId} must be an integer between 1 and 100.`;
			}

			if (seenOperatorIds.has(operator.id)) {
				return `Operator id ${operator.id} is duplicated in module ${moduleId}.`;
			}
			seenOperatorIds.add(operator.id);
		}
	}

	return true;
}

// Export all validation functions
module.exports = {
	percentageValidation,
	passwordValidation,
	outputFolderValidation,
	operatorIdValidation,
	urlValidation,
	moduleIdValidation,
	missingKeysToleranceValidation,
	booleanValidation,
	withdrawalsScopeValidation,
};
