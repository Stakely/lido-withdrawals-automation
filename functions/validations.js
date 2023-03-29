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

function outputFolderValidation(input) {
    return fs.existsSync(input) ? true : 'Output folder not found. Please enter a valid folder path.';
}

function operatorIdValidation(value) {
    const intValue = parseInt(value, 10);
    if (isNaN(intValue) || intValue <= 0) {
        return 'Please enter a valid integer greater than 0 for the operator ID.';
    }
    return true;
}

function passwordValidation(value) {
    return value.trim() !== '' ? true : 'The password cannot be empty.';
}

function moduleIdValidation(value) {
    return value != '' ? true : 'The module ID cannot be empty.';
}

// Exportamos las funciones
module.exports = {
    percentageValidation,
    passwordValidation,
    outputFolderValidation,
    operatorIdValidation,
    urlValidation,
    moduleIdValidation
};