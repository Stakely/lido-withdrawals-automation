const url = require('url');
const fs = require('fs');

function isValidUrl(inputUrl) {
    try {
        const parsedUrl = new url.URL(inputUrl);
        return ['http:', 'https:'].includes(parsedUrl.protocol);
    } catch (error) {
        return false;
    }
}

function percentageValidation(input) {
    const value = parseInt(input, 10);
    return value >= 1 && value <= 100 ? true : 'Invalid percentage. Please enter a value between 1 and 100.';
}

function urlValidation(input) {
    return isValidUrl(input) ? true : 'Invalid URL. Please enter a valid URL.';
}

function passwordFileValidation(input) {
    try {
        const fileContent = fs.readFileSync(input, 'utf-8');
        return fileContent.trim() !== '' ? true : 'Empty file. The .password file cannot be empty.';
    } catch (error) {
        return 'File not found. Please enter a valid .password file path.';
    }
}

function outputFolderValidation(input) {
    return fs.existsSync(input) ? true : 'Output folder not found. Please enter a valid folder path.';
}

function chainIdValidation(value) {
    const intValue = parseInt(value, 10);
    if (isNaN(intValue) || intValue <= 0) {
        return 'Please enter a valid integer for the chain ID.';
    }
    return true;
}

function operatorIdValidation(value) {
    const intValue = parseInt(value, 10);
    if (isNaN(intValue) || intValue <= 0) {
        return 'Please enter a valid integer greater than 0 for the operator ID.';
    }
    return true;
}

function booleanValidation(value) {
    return value === 'true' || value === 'false' ? true : 'Please enter a valid boolean value (true or false).';
}

// Exportamos las funciones
module.exports = {
    percentageValidation,
    passwordFileValidation,
    outputFolderValidation,
    chainIdValidation,
    operatorIdValidation,
    urlValidation,
    booleanValidation
};