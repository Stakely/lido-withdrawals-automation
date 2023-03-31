const axios = require('axios');

const axiosInstance = axios.create({
	headers: {
		'Content-Type': 'application/json',
	},
});

module.exports = axiosInstance;