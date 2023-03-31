const axiosInstance = require('../utils/axiosInstance.js');

async function getStateRoot(beaconNodeEndpoint) {
    try {
        const response = await axiosInstance.get(beaconNodeEndpoint + '/eth/v1/beacon/headers', {
            headers: {
                'Content-Type': 'application/json'
            },
        });
        
        const stateRoot = response.data.data[0].header.message.state_root;
        
        if (!stateRoot) {
            throw new Error('State root is empty or undefined.');
        }
        
        return stateRoot;
    } catch (error) {
        throw new Error('Failed to fetch state root from the Beacon Node. ' + error.message);
    }
}

async function getForkInfo(beaconNodeEndpoint, stateRoot) {
    try {
        const response = await axiosInstance.get(beaconNodeEndpoint + '/eth/v1/beacon/states/' + stateRoot + '/fork', {
            headers: {
                'Content-Type': 'application/json'
            },
        });
        
        const fork = response.data.data;
        if (!fork) {
            throw new Error('Fork is empty or undefined.');
        }
        
        return fork;
    } catch (error) {
        throw new Error('Failed to fetch fork info from the Beacon Node. ' + error.message);
    }
}

async function getGenesisValidatorsRoot(beaconNodeEndpoint) {
    try {
        const response = await axiosInstance.get(beaconNodeEndpoint + '/eth/v1/beacon/genesis', {
            headers: {
                'Content-Type': 'application/json'
            },
        });
        
        if(!response.data.data) {
            throw new Error('Response data is empty or undefined.');
        }
        
        const genesis_validators_root = response.data.data.genesis_validators_root;
        
        if (!genesis_validators_root) {
            throw new Error('Genesis validator root is empty or undefined.');
        }
        
        return genesis_validators_root;
    } catch (error) {
        throw new Error('Failed to fetch genesis validator root from the Beacon Node. ' + error.message);
    }
}

function buildRemoteSignerUrl(remoteSignerUrl, validatorKey) {
    return remoteSignerUrl + '/api/v1/eth2/sign/' + validatorKey;
}

function createRemoteSignerRequestBody(epoch, validatorIndex, fork, genesis_validators_root) {
    return {
        type: 'VOLUNTARY_EXIT',
        fork_info: {
            fork,
            genesis_validators_root,
        },
        voluntary_exit: {
            epoch: String(epoch),
            validator_index: String(validatorIndex),
        },
    };
}

async function requestValidatorSignature(remoteSignerUrl, body) {
    
    const response = await axiosInstance.post(remoteSignerUrl, body, {
        headers: {
            'Content-Type': 'application/json',
        },
        validateStatus: (status) => {
            return (status === 200 || status === 404);
        },
    });
    
    // 404 means that the key is not found in the remote signer
    if(response.status === 404){
        return response;
    }
    
    if(!response.data || !response.data.signature || response.data.signature.length !== 194){
        throw new Error('Remote signer is not returning a valid signature. Url: ' + remoteSignerUrl);
    }
    
    return response;
}

async function signWithdrawalMessages(validators, epoch, remoteSignerUrl, beaconNodeEndpoint) {
    
    const stateRoot = await getStateRoot(beaconNodeEndpoint);
    console.log("State root: " + stateRoot);
    
    const fork = await getForkInfo(beaconNodeEndpoint, stateRoot);
    
    const genesis_validators_root = await getGenesisValidatorsRoot(beaconNodeEndpoint);
    console.log("Genesis validator root: " + genesis_validators_root);
    
    console.log('\n');
    console.log('================= [ REQUESTING SIGNATURES ] =================');
    
    let i = 0;
    let okSignatures = 0;
    let signatures = [];
    
    for (const validator of validators) {
        i++;
        console.log('Requesting signature ' + i + '/' + validators.length + ' (Validator #' + validator.validatorIndex + ')');
        
        const body = createRemoteSignerRequestBody(epoch, validator.validatorIndex, fork, genesis_validators_root);
        const completeRemoteSignerUrl = buildRemoteSignerUrl(remoteSignerUrl, validator.key);
        
        try {
            const remoteSignerResponse = await requestValidatorSignature(completeRemoteSignerUrl, body);
            
            if (remoteSignerResponse.status === 404) {
                console.log('Key not found in remote signer. ' +  '(Validator #' + validator.validatorIndex + ')' + ' Skipping...');
                continue;
            }
            
            if (remoteSignerResponse.status !== 200) {
                throw new Error('Remote signer returned status code ' + remoteSignerResponse.status);
            }
            
            const signature = remoteSignerResponse.data.signature;
            okSignatures++;
            
            console.log('Signature of validator #' + validator.validatorIndex + ' generated successfully.');
            
            signatures.push({
                validator_index: validator.validatorIndex,
                validator_key: validator.key,
                signature: signature,
                fork_version: fork.current_version,
                epoch: epoch,
            });
            
        } catch (error) {
            throw new Error(
                'Failed to fetch data from the remote signer (Url: ' + remoteSignerUrl + '). ' + error.message + 
                '\n Complete URL: ' + remoteSignerUrl + '/api/v1/eth2/sign/' + validator.key +
                '\n Body: ' + JSON.stringify(body)
                );
            }
        }
        
        console.log('\n');
        console.log('================= [SIGNATURES REPORT] =================');
        console.log('Requested signatures: ' + i + '/' + validators.length);
        console.log('Successful signatures: ' + okSignatures + '/' + validators.length);
        console.log('Failed signatures: ' + (i - okSignatures));
        
        return signatures;
    }
    
    module.exports = {
        getStateRoot,
        getForkInfo,
        getGenesisValidatorsRoot,
        buildRemoteSignerUrl,
        createRemoteSignerRequestBody,
        requestValidatorSignature,
        signWithdrawalMessages
    };