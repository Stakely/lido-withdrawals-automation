/* eslint-disable no-undef */
const { buildFullMessage, encryptJsonMessage, saveEncryptedMessageToFile, overwritePrompt } = require("../src/withdrawal/encryptMessages");
const { decrypt } = require("@chainsafe/bls-keystore");
const inquirer = require("inquirer");
const fs = require("fs");

jest.mock("fs");

jest.mock("../src/withdrawal/encryptMessages", () => {
	const originalModule = jest.requireActual("../src/withdrawal/encryptMessages");
	return {
		...originalModule,
		encryptMessages: originalModule.encryptMessages,
		buildFullMessage: originalModule.buildFullMessage,
		encryptJsonMessage: originalModule.encryptJsonMessage,
		saveEncryptedMessageToFile: originalModule.saveEncryptedMessageToFile,
		overwritePrompt: jest.fn(originalModule.overwritePrompt),
	};
});

describe("buildFullMessage", () => {
	
	test("Should build full message to encrypt with correct properties", () => {
		const signature = {
			validator_index: 9999999,
			validator_key: "0x000key1000",
			signature: "0x187654321fedcba12987654321fedcba12987654321fedcba12987654321fedcba12987654321fedcba1254354321fedcba154321fedcba54321fedcba154321fedcba154321fedcba1154321fedcba154321fedcba154321fedcba121fedcba",
			fork_version: "0x03001020",
			epoch: 123456,
		};
		
		const result = buildFullMessage(signature);
		
		expect(result).toEqual({
			exit: {
				message: {
					epoch: "123456",
					validator_index: "9999999",
				},
				signature: signature.signature,
			},
			fork_version: signature.fork_version,
		});
	});
	
});

describe("encryptJsonMessage", () => {
	
	test("Should encrypt the message using the provided password.", async () => {
		const fullMessageJson = "{\"exit\":{\"message\":{\"epoch\":\"1\",\"validator_index\":\"-1\"},\"signature\":\"0x01234\"},\"fork_version\":\"0x03001020\"}";
		const password = "password123";
		
		const encryptedMessage = await encryptJsonMessage(fullMessageJson, password);
		
		// Decrypt the message
		const decryptedMessageU8 = await decrypt(encryptedMessage, password);
		const decryptedMessageJson = new TextDecoder().decode(decryptedMessageU8);
		
		// Check if the original and decrypted messages are the same
		expect(decryptedMessageJson).toEqual(fullMessageJson);
		
	});
	
});

describe("overwritePrompt", () => {
	
	test("Should return user response for overwrite prompt", async () => {
		const fileName = "test_file.json";
		
		// Mock inquirer.prompt to return a specified user response
		jest.spyOn(inquirer, "prompt").mockResolvedValueOnce({ overwrite: true });
		
		// Call overwritePrompt function
		const overwrite = await overwritePrompt(fileName);
		
		// Check if the user response is returned as expected
		expect(overwrite).toBe(true);
		
		// Check if inquirer.prompt was called with the correct arguments
		expect(inquirer.prompt).toHaveBeenCalledWith([
			{
				type: "confirm",
				name: "overwrite",
				message: `File ${fileName} already exists. Overwrite?`,
				default: true,
			},
		]);
		
		// Restore the original inquirer.prompt function
		inquirer.prompt.mockRestore();
	});
	
});

describe("saveEncryptedMessageToFile", () => {
	
	test("Should save encrypted message to file successfully", async () => {
		const outputFolder = "test_output";
		const fileName = "test_file.json";
		const store = {
			encryptedData: "someEncryptedData",
		};
		
		// Mock fs.writeFileSync and fs.existsSync to simulate a successful write
		fs.writeFileSync.mockImplementationOnce(() => {});
		fs.existsSync.mockReturnValueOnce(true);
		
		// Call saveEncryptedMessageToFile function
		const result = await saveEncryptedMessageToFile(outputFolder, fileName, store);
		
		// Check if the file was written and exists
		expect(result).toBe(true);
		
		// Check if fs.writeFileSync was called with the correct arguments
		expect(fs.writeFileSync).toHaveBeenCalledWith(`${outputFolder}/${fileName}`,JSON.stringify(store));
		
		// Check if fs.existsSync was called with the correct arguments
		expect(fs.existsSync).toHaveBeenCalledWith(`${outputFolder}/${fileName}`);
		
		// Clear the mock implementations
		fs.writeFileSync.mockClear();
		fs.existsSync.mockClear();
	});
	
});
