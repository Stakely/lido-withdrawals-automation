const { create } = require('@chainsafe/bls-keystore');
const utils = require('ethers');
const fs = require('fs');
const inquirer = require('inquirer');

async function encryptMessages(signatures, outputFolder, passwordFile){

    // Get content of the password file
    const password = fs.readFileSync(passwordFile, 'utf-8').trim();

    // For each signature, encrypt the message
    let encryptedSignatures=0;
    let skippedSignatures=0;
    for (const signature of signatures) {
        
        const fullMessage = {
            "exit": {
                "message": {
                    "epoch": signature.epoch,
                    "validator_index": signature.validator_index
                },
                "signature": signature.signature
            },
            "fork_version": signature.fork_version
        };

        console.log(fullMessage);

        // Full message to JSON
        const fullMessageJson = JSON.stringify(fullMessage);

        const fullMessageU8 = await utils.toUtf8Bytes(fullMessageJson);
        const pubkey = new Uint8Array();
        const path = '';

        const fileName = `${signature.validator_index}_${signature.validator_key}_exit.json`;

        // Check if file exists and ask for overwrite
        if (fs.existsSync(`${outputFolder}/${fileName}`)) {
            const question = await inquirer.prompt([{
                type: 'confirm',
                name: 'overwrite',
                message: `File ${fileName} already exists. Overwrite?`,
                default: true,
            }]);

            if (!question.overwrite) {
                skippedSignatures++;
                continue;
            }
        }

        // Encrypt the message
        const store = await create(password, fullMessageU8, pubkey, path);

        // Write the encrypted message to a file
        try{
            fs.writeFileSync(`${outputFolder}/${fileName}`, JSON.stringify(store));
        } catch (err) {
            throw new Error(`Error writing file ${fileName}: ${err}`);
        }

        if (fs.existsSync(`${outputFolder}/${fileName}`)) {
            encryptedSignatures++;
        }

    }

    // Report
    console.log('\n');
    console.log('================= [ENCRYPTION REPORT] =================');
    console.log('Signatures to encrypt: ' + signatures.length);
    console.log('Successful encrypted signatures: ' + encryptedSignatures + '/' + signatures.length);
    console.log('Skipped by user: ' + skippedSignatures);
    console.log('Failed (not skipped by user): ' + (signatures.length - encryptedSignatures - skippedSignatures));

    console.log('\n');
    if(signatures.length - encryptedSignatures - skippedSignatures !== 0){
        console.error('Some signatures were not encrypted. Check the report above.');
    }

    return;

}

module.exports = { encryptMessages };