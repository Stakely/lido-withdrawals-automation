const { buildKapiUrl, fetchDataFromKAPI, validateKapiJsonResponse } = require('../src/withdrawal/fetchValidatorsData.js');
const MockAdapter = require('axios-mock-adapter');
const axiosInstance = require('../src/utils/axiosInstance.js');

describe('buildKapiUrl', () => {
    test('Should return a complete KAPI URL', async () => {
        
        const kapiUrl = 'http://localhost:3000';
        const moduleId = '1';
        const operatorId = '999999';
        const percentage = 55;
        
        const expectedUrl = 'http://localhost:3000/v1/modules/1/validators/exits_presign/999999?percent=55';
        
        const result = await buildKapiUrl(kapiUrl, moduleId, operatorId, percentage);
        
        expect(result).toEqual(expectedUrl);
    });
});

describe('validateKapiJsonResponse', () => {
    
    test('Should validate a correct KAPI JSON response', async () => {
        const validKapiJsonResponse = {
            data: [
                {
                    validatorIndex: 270195,
                    key: '0xa464dd4f1d86f68e69ec56e9e0b1fbf57f0683e286081c23e51a1fec2185ff3919176409ad85859f42f34f0e44275ef6',
                },
            ],
            meta: {
                clBlockSnapshot: {
                    epoch: 165638,
                    root: '0xe7282729e1fe706fea3264b8f5010d307cb431260d8ebda322e2b511e87755fd',
                    slot: 5300416,
                    blockNumber: 8739674,
                    timestamp: 1680112992,
                    blockHash: '0x9e9bb6ecec839cfcfc44d2f4e976221c0f084b2b4d87e2ca170fd0b4bee39b02',
                },
            },
        };
        
        await expect(async () => {
            await validateKapiJsonResponse(validKapiJsonResponse);
        }).not.toThrowError();
    });
    
    
    test('Should throw an error when data is an empty array', async () => {
        const invalidKapiJsonResponse = {
            data: [],
            meta: {
                clBlockSnapshot: {
                    epoch: 165638,
                    root: '0xe7282729e1fe706fea3264b8f5010d307cb431260d8ebda322e2b511e87755fd',
                    slot: 5300416,
                    blockNumber: 8739674,
                    timestamp: 1680112992,
                    blockHash: '0x9e9bb6ecec839cfcfc44d2f4e976221c0f084b2b4d87e2ca170fd0b4bee39b02',
                },
            },
        };
        
        await expect(async () => {
            await validateKapiJsonResponse(invalidKapiJsonResponse);
        }).rejects.toThrow(/Data \(validators\) length from KAPI is 0/);
    });
    
    test('Should throw an error when data item is missing validatorIndex field', async () => {
        const invalidKapiJsonResponse = {
            data: [
                {
                    key: '0xa464dd4f1d86f68e69ec56e9e0b1fbf57f0683e286081c23e51a1fec2185ff3919176409ad85859f42f34f0e44275ef6',
                },
            ],
            meta: {
                clBlockSnapshot: {
                    epoch: 165638,
                    root: '0xe7282729e1fe706fea3264b8f5010d307cb431260d8ebda322e2b511e87755fd',
                    slot: 5300416,
                    blockNumber: 8739674,
                    timestamp: 1680112992,
                    blockHash: '0x9e9bb6ecec839cfcfc44d2f4e976221c0f084b2b4d87e2ca170fd0b4bee39b02',
                },
            },
        };
        
        await expect(async () => {
            await validateKapiJsonResponse(invalidKapiJsonResponse);
        }).rejects.toThrow(/Data item is missing "validatorIndex" or "key" field/);
    });
    
    test('Should throw an error when meta or clBlockSnapshot field is missing', async () => {
        const invalidKapiJsonResponse = {
            data: [
                {
                    validatorIndex: 270195,
                    key: '0xa464dd4f1d86f68e69ec56e9e0b1fbf57f0683e286081c23e51a1fec2185ff3919176409ad85859f42f34f0e44275ef6',
                },
            ],
            meta: {
                clBlockSnapshot: null,
            },
        };
        
        await expect(async () => {
            await validateKapiJsonResponse(invalidKapiJsonResponse);
        }).rejects.toThrow(/Meta or clBlockSnapshot field is missing/);
    });
    
    test('Should throw an error when epoch field is missing', async () => {
        const invalidKapiJsonResponse = {
            data: [
                {
                    validatorIndex: 1,
                    key: '0x123',
                },
            ],
            meta: {
                clBlockSnapshot: {
                    
                },
            },
        };
        
        await expect(async () => {
            await validateKapiJsonResponse(invalidKapiJsonResponse);
        }).rejects.toThrow(/Epoch field is missing or not an integer/);
    });
    
    test('Should throw an error when epoch field is not an integer', async () => {
        const invalidKapiJsonResponse = {
            data: [
                {
                    validatorIndex: 1,
                    key: '0x123',
                },
            ],
            meta: {
                clBlockSnapshot: {
                    epoch: 'not an integer',
                },
            },
        };
        
        await expect(async () => {
            await validateKapiJsonResponse(invalidKapiJsonResponse);
        }).rejects.toThrow(/Epoch field is missing or not an integer/);
    });
    
});

const mock = new MockAdapter(axiosInstance);

describe('fetchValidatorsData', () => {
    afterEach(() => {
        mock.reset();
    });
    
    test('Should return data when KAPI response is valid', async () => {
        const kapiUrl = 'http://localhost:3000';
        const moduleId = '1';
        const operatorId = '9999999';
        const percentage = 10;
        
        const mockedResponse = {
            data: [
                {
                    validatorIndex: 1,
                    key: 'key1',
                },
                {
                    validatorIndex: 2,
                    key: 'key2',
                },
            ],
            meta: {
                clBlockSnapshot: {
                    epoch: 2,
                },
            },
        };
        
        const fullUrl = await buildKapiUrl(kapiUrl, moduleId, operatorId, percentage);
        
        mock.onGet(fullUrl).reply(200, mockedResponse);
        
        const result = await fetchDataFromKAPI(fullUrl);
        
        expect(result).toEqual(mockedResponse);
        
    });
    
    test('Should throw an error when KAPI response is 404', async () => {
        
        const kapiUrl = 'http://localhost:3000';
        const moduleId = '1';
        const operatorId = '9999999';
        const percentage = 10;
        
        const mockedResponse = 'not valid json';
        
        const fullUrl = await buildKapiUrl(kapiUrl, moduleId, operatorId, percentage);
        
        mock.onGet(fullUrl).reply(404, mockedResponse);
        
        await expect(async () => {
            await fetchDataFromKAPI(fullUrl);
        }).rejects.toThrow(/Failed to fetch data from the KAPI/);
        
    });
    
    test('Should throw an error when KAPI does not response (time out)', async () => {
        
        const kapiUrl = 'http://localhost:3000';
        const moduleId = '1';
        const operatorId = '9999999';
        const percentage = 10;
        
        const mockedResponse = 'whatever';
        
        const fullUrl = await buildKapiUrl(kapiUrl, moduleId, operatorId, percentage);
        
        mock.onGet(fullUrl).timeout();
        
        await expect(async () => {
            await fetchDataFromKAPI(fullUrl);
        }).rejects.toThrow(/timeout of 0ms exceeded/);
        
    });
    
});