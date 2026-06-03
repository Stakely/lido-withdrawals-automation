const inquirer = require("inquirer").default;
const { percentageValidation, passwordValidation, outputFolderValidation, operatorIdValidation, urlValidation, moduleIdValidation, missingKeysToleranceValidation, booleanValidation, withdrawalsScopeValidation } = require("./src/utils/validations");
const { resolveScope, buildScopeFromSinglePair, expandScope } = require("./src/utils/scope");
const { fetchValidatorsData } = require("./src/withdrawal/fetchValidatorsData");
const { signWithdrawalMessages } = require("./src/withdrawal/signWithdrawalMessages");
const { encryptMessages } = require("./src/withdrawal/encryptMessages");

// Load environment variables from the .env file
require("dotenv").config();

async function main() {

	console.log("\n");
	console.info("🚀 Lido Withdrawals Automation developed by Stakely.io - v1.4.0");
	console.log("\n");
	console.info("Step 1: Checking environment variables and asking for missing values...");

	// Get values from environment variables or undefined if not present
	const env = {
		percentage: process.env.PERCENTAGE,
		kapiUrl: process.env.KAPI_URL,
		remoteSignerUrl: process.env.REMOTE_SIGNER_URL,
		password: process.env.PASSWORD,
		outputFolder: process.env.OUTPUT_FOLDER,
		operatorId: process.env.OPERATOR_ID,
		beaconNodeUrl: process.env.BEACON_NODE_URL,
		moduleId: process.env.MODULE_ID,
		withdrawalsScope: process.env.WITHDRAWALS_SCOPE,
		missingKeysTolerance: process.env.MISSING_KEYS_TOLERANCE,
		useCurrentForkVersion: process.env.USE_CURRENT_FORK_VERSION,
	};

	// Validate environment variables
	for (const [key, value] of Object.entries(env)) {

		// If the value is undefined, skip the validation, it will be asked later
		if(value === undefined) {
			continue;
		}

		const validationFunction = {
			percentage: percentageValidation,
			kapiUrl: urlValidation,
			remoteSignerUrl: urlValidation,
			password: passwordValidation,
			outputFolder: outputFolderValidation,
			operatorId: operatorIdValidation,
			beaconNodeUrl: urlValidation,
			moduleId: moduleIdValidation,
			withdrawalsScope: withdrawalsScopeValidation,
			missingKeysTolerance: missingKeysToleranceValidation,
			useCurrentForkVersion: booleanValidation,
		}[key];

		const validationResult = validationFunction(value);
		if (validationResult !== true) {
			console.error(
				"lido-withdrawals-automation failed.",
				`Error in environment variable ${key}: ${validationResult}`
			);
			process.exit(1);
		}
	}

	// Resolve the withdrawals scope from the environment variables.
	// Returns null when there is not enough information and we must ask for a
	// single module/operator/percentage interactively.
	let scope = resolveScope({
		withdrawalsScope: env.withdrawalsScope,
		moduleId: env.moduleId,
		operatorId: env.operatorId,
		percentage: env.percentage,
	});

	// Ask for missing values
	const questions = [];

	if (!env.kapiUrl) {
		questions.push({
			type: "input",
			name: "kapiUrl",
			message: "Please enter the Kapi endpoint URL:",
			validate: urlValidation,
		});
	}

	if (!env.remoteSignerUrl) {
		questions.push({
			type: "input",
			name: "remoteSignerUrl",
			message: "Please enter the remote signer URL:",
			validate: urlValidation,
		});
	}

	if (!env.password) {
		questions.push({
			type: "input",
			name: "password",
			message: "Please enter a password to encrypt the withdrawal messages:",
			validate: passwordValidation,
		});
	}

	if (!env.outputFolder) {
		questions.push({
			type: "input",
			name: "outputFolder",
			message: "Please enter the path to the output folder:",
			validate: outputFolderValidation,
		});
	}

	if (!env.beaconNodeUrl) {
		questions.push({
			type: "input",
			name: "beaconNodeUrl",
			message: "Please enter the beacon node URL:",
			validate: urlValidation,
		});
	}

	// If no scope could be resolved from the environment, ask for a single
	// module/operator/percentage and build a one-pair scope from the answers.
	if (scope === null) {
		questions.push({
			type: "input",
			name: "moduleId",
			message: "Please enter the module ID:",
			validate: moduleIdValidation,
		});
		questions.push({
			type: "input",
			name: "operatorId",
			message: "Please enter the operator ID:",
			validate: operatorIdValidation,
		});
		questions.push({
			type: "input",
			name: "percentage",
			message: "Please enter the percentage of validators (1 to 100):",
			validate: percentageValidation,
		});
	}

	const answers = await inquirer.prompt(questions);

	if (scope === null) {
		scope = buildScopeFromSinglePair(answers.moduleId, answers.operatorId, answers.percentage);
	}

	// Combine environment variables and answers or default values.
	const params = {
		kapiUrl: env.kapiUrl || answers.kapiUrl,
		remoteSignerUrl: env.remoteSignerUrl || answers.remoteSignerUrl,
		password: env.password || answers.password,
		outputFolder: env.outputFolder || answers.outputFolder,
		beaconNodeUrl: env.beaconNodeUrl || answers.beaconNodeUrl,
		missingKeysTolerance: env.missingKeysTolerance || 0,
		useCurrentForkVersion: env.useCurrentForkVersion === "true",
	};

	// Expand the scope into the list of (module, operator, percent) pairs to process.
	const pairs = expandScope(scope);

	// Process every pair (fetch + sign). Signatures are accumulated and encrypted
	// once at the end, so if any pair fails the whole process aborts without
	// writing partial output.
	const allSignatures = [];
	let pairIndex = 0;

	for (const { moduleId, operatorId, percent } of pairs) {
		pairIndex++;
		console.log("\n");
		console.log(`================= [ PAIR ${pairIndex}/${pairs.length} ] =================`);
		console.log(`Module: ${moduleId}   Operator Id: ${operatorId}   Percent: ${percent}%`);

		// Get validators data from Kapi
		console.log("Step 2: Fetching validators data from Kapi...");

		const kapiJsonResponse = await fetchValidatorsData(
			params.kapiUrl, // Kapi URL
			moduleId, // Module ID
			operatorId, // Operator ID
			percent // Percentage of validators for this operator
		);

		console.log("Step 3: Creating the withdrawal messages and signing them with the remote signer...");

		const signatures = await signWithdrawalMessages(
			kapiJsonResponse.data, // Validators data (public keys)
			kapiJsonResponse.meta.clBlockSnapshot.epoch, // Epoch from Kapi
			params.remoteSignerUrl, // Remote signer URL
			params.beaconNodeUrl, // Beacon node URL
			params.missingKeysTolerance, // Missing keys tolerance
			params.useCurrentForkVersion // Use current fork version instead of Capella
		);

		allSignatures.push(...signatures);
	}

	console.log("\n");
	console.log("Step 4: Encrypt the signed messages with the password file and save them to the output folder...");

	await encryptMessages(
		allSignatures, // Signed messages from every pair
		params.outputFolder, // Output folder
		params.password, // File with the password
	);

	console.log("\n");
	console.log("lido-withdrawals-automation completed successfully.");

}

main();

// Cath all unhanded exceptions
process.on("unhandledRejection", (error) => {
	console.error("lido-withdrawals-automation failed. Error:", error.message);
	process.exit(1);
});
