const axios = require('axios');
const https = require('https');

async function createWithdrawalMessage(validators, epoch, remoteSignerUrl, beaconNodeEndpoint, skipRemoteSignerSslVerification) {

    // Get fork info
    let fork = null;
    try {

        // Request state_root from a beacon node
        const stateRootResponse = await axios.get(beaconNodeEndpoint + '/eth/v1/beacon/headers', {
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
        });

        console.log("State root: " + stateRootResponse.data.data[0].header.message.state_root);

        // Is state_root empty or undefined?
        if (!stateRootResponse.data.data[0].header.message.state_root) {
            throw new Error('State root is empty or undefined.');
        }

        // Request fork info from a beacon node
        const forkResponse = await axios.get(beaconNodeEndpoint + '/eth/v1/beacon/states/' + stateRootResponse.data.data[0].header.message.state_root + '/fork', {
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
        });

        // Is fork empty or undefined?
        fork = forkResponse.data.data;
        if (!fork) {
            throw new Error('Fork is empty or undefined.');
        }

    }catch(error){
        throw new Error('Failed to fetch data from the Beacon Node (Url: ' + beaconNodeEndpoint + '). ' + error.message);
    }

    // Get genesis validator 
    let genesis_validators_root = null;
    try {
            
        // Request genesis validator root from a beacon node
        const genesisResponse = await axios.get(beaconNodeEndpoint + '/eth/v1/beacon/genesis', {
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
        });

        // Is genesis_validators_root empty or undefined?
        genesis_validators_root = genesisResponse.data.data.genesis_validators_root;
        if (!genesis_validators_root) {
            throw new Error('Genesis validator root is empty or undefined.');
        }

        console.log("Genesis validator root: " + genesis_validators_root);

    }catch(error){
        throw new Error('Failed to fetch data from the Beacon Node (Url: ' + beaconNodeEndpoint + '). ' + error.message);
    }

    console.log('\n');
    console.log('================= [ REQUESTING SIGNATURES ] =================');
    
    // Foreach validator, request signature from remote signer
    let i = 0;
    let okSignatures = 0;
	let completeRemoteSignerUrl = null;
    for (const validator of validators) {

        i++;

        console.log('Requesting signature ' + i + '/' + validators.length + ' (Validator #' + validator.validatorIndex + ')');

        const body = {
            type: 'VOLUNTARY_EXIT',
            fork_info: {
                fork,
                genesis_validators_root,
            },
            voluntary_exit: {
                epoch: String(epoch),
                validator_index: String(validator.validatorIndex),
            }
        }

		completeRemoteSignerUrl = remoteSignerUrl + '/api/v1/eth2/sign/' + validator.key;

        try {
            
			// Request signature from remote signer
			const remoteSignerResponse = await fetch(completeRemoteSignerUrl, {
				method: 'POST',
				headers: {
				'Content-Type': 'application/json',
				Accept: 'application/json',
				},
				body: JSON.stringify(body),
				agent: skipRemoteSignerSslVerification
				? new https.Agent({
					rejectUnauthorized: false,
					checkServerIdentity: () => undefined,
					})
				: undefined,
			});
			
            // Key is not found in remote signer
            if (remoteSignerResponse.status === 404) {
                console.log('Key not found in remote signer. ' +  '(Validator #' + validator.validatorIndex + ')' + ' Skipping...');
                continue;
            }

			// Status code is not 200
			if (remoteSignerResponse.status !== 200) {
				throw new Error('Remote signer returned status code ' + remoteSignerResponse.status);
			}
                
			const remoteSignerResponseBody = await remoteSignerResponse.json();

            const signature = remoteSignerResponseBody.signature;
            okSignatures++;
        
            console.log(signature, '(Validator #' + validator.validatorIndex + ')');
        
        } catch (error) {
            throw new Error(
				'Failed to fetch data from the remote signer (Url: ' + remoteSignerUrl + '). ' + error.message + 
				'\n Complete URL: ' + remoteSignerUrl + '/api/v1/eth2/sign/' + validator.key +
				'\n Body: ' + JSON.stringify(body)
			);
				
        }        
        
    }

    // Report
    console.log('\n');
    console.log('================= [SIGNATURES REPORT] =================');
    console.log('Requested signatures: ' + i + '/' + validators.length);
    console.log('Successful signatures: ' + okSignatures + '/' + validators.length);
    console.log('Failed signatures: ' + (i - okSignatures));

  }

module.exports = {
    createWithdrawalMessage,
};