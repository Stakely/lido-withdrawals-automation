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
    let signatures = [];
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
            
            const remoteSignerResponse = await axios.post(completeRemoteSignerUrl, body, {
                headers: {
                    'Content-Type': 'application/json'
                },
                validateStatus: (status) => {
                    return (status === 200 || status === 404);
                }
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
            
            const signature = remoteSignerResponse.data.signature;
            okSignatures++;
            
            // Length of signature must be 194 (0x + 192 chars)
            if(!signature || signature.length !== 194){
                throw new Error('Signature of validator: ' + validator.validatorIndex + ' is empty or has an invalid length.');
            }
            
            console.log('Signature of validator #' + validator.validatorIndex + ' generated successfully.');

            
            // Add the signature and details to the array of signatures
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
        
        // Report
        console.log('\n');
        console.log('================= [SIGNATURES REPORT] =================');
        console.log('Requested signatures: ' + i + '/' + validators.length);
        console.log('Successful signatures: ' + okSignatures + '/' + validators.length);
        console.log('Failed signatures: ' + (i - okSignatures));
        
        // Return signatures
        return signatures;
        
    }
    
    module.exports = {
        createWithdrawalMessage,
    };