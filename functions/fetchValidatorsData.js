const axios = require('axios');

async function fetchValidatorsData(kapiUrl, moduleId, operatorId, percentage) {
  try {

    const response = await axios.get(
      `${kapiUrl}/v1/modules/${moduleId}/validators/validator-exits-to-prepare/${operatorId}?percent=${percentage}`
    );

		let kapiJsonResponse = response.data;

		// Check validators data length
		if (kapiJsonResponse.data.length === 0) {
		throw new Error('Data (validators) length from KAPI is 0');
		}

		// Check validators data fields
		for (const validator of kapiJsonResponse.data) {
		if (!validator.validatorIndex || !validator.key) {
			throw new Error('Data item is missing "validatorIndex" or "key" field');
		}
		}

		// Check epoch is an integer
		if (typeof kapiJsonResponse.meta.clBlockSnapshot.epoch !== 'number' || !Number.isInteger(kapiJsonResponse.meta.clBlockSnapshot.epoch)) {
		throw new Error('Epoch field is missing or not an integer');
		}

		return kapiJsonResponse;

  } catch (error) {
    throw new Error('Failed to fetch data from the KAPI (Url: ' + kapiUrl + '). ' + error.message);
  }
}

module.exports = {
  fetchValidatorsData,
};
