const inquirer = require('inquirer');
const { percentageValidation, passwordFileValidation, outputFolderValidation, chainIdValidation, operatorIdValidation, urlValidation } = require('./functions/validations');
const { fetchValidatorsData } = require('./functions/fetchValidatorsData');
const { createWithdrawalMessage } = require('./functions/createWithdrawalMessage');

// Load environment variables from the .env file
require('dotenv').config();

async function main() {

    console.log('\n');
    console.info('🚀 Lido Withdrawals Automation developed by Stakely.io - 2023 v1.0');
    console.log('\n');
    console.info('Step 1: Checking environment variables and asking for missing values...');

    // Chains mapping
    const chains = {
        1: {name: 'Ethereum Mainnet', module_id: '1'},
        5: {name: 'Goerli Testnet', module_id: '1'},
        1337803: {name: 'Zhejiang Testnet', module_id: '1'}
    };

    // Get values from environment variables or undefined if not present
    const env = {
        percentage: process.env.PERCENTAGE,
        kapiUrl: process.env.KAPI_URL,
        remoteSignerUrl: process.env.REMOTE_SIGNER_URL,
        passwordFile: process.env.PASSWORD_FILE,
        outputFolder: process.env.OUTPUT_FOLDER,
        chainId: process.env.CHAIN_ID,
        operatorId: process.env.OPERATOR_ID,
        beaconNodeUrl: process.env.BEACON_NODE_URL,
    };

    // Validate environment variables
    for (const [key, value] of Object.entries(env)) {
        const validationFunction = {
            percentage: percentageValidation,
            kapiUrl: urlValidation,
            remoteSignerUrl: urlValidation,
            passwordFile: passwordFileValidation,
            outputFolder: outputFolderValidation,
            chainId: chainIdValidation,
            operatorId: operatorIdValidation,
            beaconNodeUrl: urlValidation,
        }[key];

        const validationResult = validationFunction(value);
        if (value && validationResult !== true) {
            console.error(`Error in environment variable ${key}: ${validationResult}`);
            return;
        }
    }

    // Ask for missing values
    const questions = [];

    if (!env.percentage) {
        questions.push({
            type: 'input',
            name: 'percentage',
            message: 'Please enter the percentage of validators (1 to 100):',
            validate: percentageValidation,
        });
    }

    if (!env.kapiUrl) {
        questions.push({
            type: 'input',
            name: 'kapiUrl',
            message: 'Please enter the Kapi endpoint URL:',
            validate: urlValidation,
        });
    }

    if (!env.remoteSignerUrl) {
        questions.push({
            type: 'input',
            name: 'remoteSignerUrl',
            message: 'Please enter the remote signer URL:',
            validate: urlValidation,
        });
    }

    if (!env.passwordFile) {
        questions.push({
            type: 'input',
            name: 'passwordFile',
            message: 'Please enter the path to the .password file:',
            validate: passwordFileValidation,
        });
    }

    if (!env.outputFolder) {
        questions.push({
            type: 'input',
            name: 'outputFolder',
            message: 'Please enter the path to the output folder:',
            validate: outputFolderValidation,
        });
    }

    if (!env.chainId) {
        questions.push({
            type: 'input',
            name: 'chainId',
            message: 'Please enter the chain ID:',
            validate: chainIdValidation,
        });
    }

    if (!env.operatorId) {
        questions.push({
            type: 'input',
            name: 'operatorId',
            message: 'Please enter the operator ID:',
            validate: operatorIdValidation,
        });
    }

    if (!env.beaconNodeUrl) {
        questions.push({
            type: 'input',
            name: 'beaconNodeUrl',
            message: 'Please enter the beacon node URL:',
            validate: urlValidation,
        });
    }

    const answers = await inquirer.prompt(questions);

    // Combine environment variables and answers
    const params = {
        percentage: env.percentage || answers.percentage,
        kapiUrl: env.kapiUrl || answers.kapiUrl,
        remoteSignerUrl: env.remoteSignerUrl || answers.remoteSignerUrl,
        passwordFile: env.passwordFile || answers.passwordFile,
        outputFolder: env.outputFolder || answers.outputFolder,
        chainId: env.chainId || answers.chainId,
        operatorId: env.operatorId || answers.operatorId,
        beaconNodeUrl: env.beaconNodeUrl || answers.beaconNodeUrl,
    };

    // Get validators data from Kapi

    console.log('Step 2: Fetching validators data from Kapi...');

    const kapiJsonResponse = await fetchValidatorsData(
        params.kapiUrl, // Kapi URL
        chains[params.chainId].module_id, // Module ID
        params.operatorId, // Operator ID
        params.percentage // Percentage of validators
    );

    console.log('Step 3: Creating the withdrawal messages and signing them with the remote signer...');

    await createWithdrawalMessage(
        kapiJsonResponse.data, // Validators data (public keys)
        kapiJsonResponse.meta.clBlockSnapshot.epoch, // Epoch from Kapi
        params.remoteSignerUrl, // Remote signer URL
        params.beaconNodeUrl, // Beacon node URL
    );

    console.log('\n');
    console.log('Step 4: Encrypt the signed messages with the password file and save them to the output folder...');

     //await encryptMessages(
     //   params.outputFolder, // Output folder
     //   params.passwordFile, // File with the password
    // );

    //console.log(jsonData);
}

main();