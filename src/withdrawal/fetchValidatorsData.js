const axiosInstance = require('../utils/axiosInstance.js');

// This function fetches data from the KAPI
async function fetchDataFromKAPI(url) {
	try {
		const response = await axiosInstance.get(url, {
			headers: {
				'Content-Type': 'application/json',
				Accept: 'application/json',
			},
		});
		return response.data;
	} catch (error) {
		throw new Error('Failed to fetch data from the KAPI (Url: ' + url + '). ' + error.message);
	}
}


// This function validates the entire KAPI JSON response
async function validateKapiJsonResponse(kapiJsonResponse) {
	// Validate that data is an array
	if (!Array.isArray(kapiJsonResponse.data)) {
		throw new Error('Data field is not an array');
	}
	
	// Validate data length
	if (kapiJsonResponse.data.length === 0) {
		throw new Error('Data (validators) length from KAPI is 0');
	}
	
	// Validate data fields
	for (const validator of kapiJsonResponse.data) {
		if (!validator.validatorIndex || !validator.key) {
			throw new Error('Data item is missing "validatorIndex" or "key" field');
		}
	}
	
	// Validate that meta and clBlockSnapshot exist
	if (!kapiJsonResponse.meta || !kapiJsonResponse.meta.clBlockSnapshot) {
		throw new Error('Meta or clBlockSnapshot field is missing');
	}
	
	// Validate epoch field
	const epoch = kapiJsonResponse.meta.clBlockSnapshot.epoch;
	
	if (typeof epoch !== 'number' || !Number.isInteger(epoch)) {
		throw new Error('Epoch field is missing or not an integer');
	}
}

// This function builds the complete KAPI url
async function buildKapiUrl(kapiUrl, moduleId, operatorId, percentage) {
	// Note: in the official KAPI, the method "exists_presign" is not available, so we use "validator-exits-to-prepare" method instead for local testing
	return `${kapiUrl}/v1/modules/${moduleId}/validators/exists_presign/${operatorId}?percent=${percentage}`;
}

// This function fetches validators data from the KAPI
async function fetchValidatorsData(kapiUrl, moduleId, operatorId, percentage) {
	
	// Generate the complete KAPI url
	const completeKapiUrl = await buildKapiUrl(kapiUrl, moduleId, operatorId, percentage);
	
	// Fetch data from the KAPI
	const kapiJsonResponse = await fetchDataFromKAPI(completeKapiUrl);
	
	// Validate the data
	await validateKapiJsonResponse(kapiJsonResponse);
	
	return kapiJsonResponse;
	
}

module.exports = {
	validateKapiJsonResponse,
	fetchValidatorsData,
	buildKapiUrl,
	fetchDataFromKAPI,
};
