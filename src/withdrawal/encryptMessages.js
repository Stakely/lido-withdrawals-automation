const { create } = require('@chainsafe/bls-keystore');
const utils = require('ethers');
const fs = require('fs');
const inquirer = require('inquirer');

function buildFullMessage(signature) {
  return {
    exit: {
      message: {
        epoch: String(signature.epoch),
        validator_index: String(signature.validator_index),
      },
      signature: signature.signature,
    },
    fork_version: signature.fork_version,
  };
}

async function encryptJsonMessage(fullMessageJson, password) {
  const fullMessageU8 = await utils.toUtf8Bytes(fullMessageJson);
  const pubkey = new Uint8Array();
  const path = '';
  return create(password, fullMessageU8, pubkey, path);
}

async function saveEncryptedMessageToFile(outputFolder, fileName, store) {
  try {
    fs.writeFileSync(`${outputFolder}/${fileName}`, JSON.stringify(store));
    return fs.existsSync(`${outputFolder}/${fileName}`);
  } catch (err) {
    throw new Error(`Error writing file ${fileName}: ${err}`);
  }
}

async function overwritePrompt(fileName) {
  const question = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'overwrite',
      message: `File ${fileName} already exists. Overwrite?`,
      default: true,
    },
  ]);
  
  return question.overwrite;
}

async function encryptMessages(signatures, outputFolder, password) {
  let encryptedSignatures = 0;
  let skippedSignatures = 0;
  for (const signature of signatures) {
    const fullMessage = buildFullMessage(signature);
    const fullMessageJson = JSON.stringify(fullMessage);
    const fileName = `${signature.validator_index}_${signature.validator_key}_exit.json`;
    
    if (fs.existsSync(`${outputFolder}/${fileName}`)) {
      const overwrite = await overwritePrompt(fileName);
      if (!overwrite) {
        skippedSignatures++;
        continue;
      }
    }
    
    const store = await encryptJsonMessage(fullMessageJson, password);
    const successfulWrite = await saveEncryptedMessageToFile(outputFolder, fileName, store);
    
    if (successfulWrite) {
      encryptedSignatures++;
    }
  }
  
  console.log('\n');
  console.log('================= [ENCRYPTION REPORT] =================');
  console.log('Signatures to encrypt: ' + signatures.length);
  console.log('Successful encrypted signatures: ' + encryptedSignatures + '/' + signatures.length);
  console.log('Skipped by user: ' + skippedSignatures);
  console.log('Failed (not skipped by user): ' + (signatures.length - encryptedSignatures - skippedSignatures));
  
  console.log('\n');
  if (signatures.length - encryptedSignatures - skippedSignatures !== 0) {
    console.error('Some signatures were not encrypted. Check the report above.');
  }
  
  return;
}

module.exports = {
  encryptMessages,
  buildFullMessage,
  encryptJsonMessage,
  saveEncryptedMessageToFile,
  overwritePrompt,
};