[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
![GitHub package.json version](https://img.shields.io/github/package-json/v/Stakely/lido-withdrawals-automation)
[![GitHub issues](https://img.shields.io/github/issues/Stakely/lido-withdrawals-automation.svg)](https://github.com/Stakely/lido-withdrawals-automation/issues)
[![GitHub stars](https://img.shields.io/github/stars/Stakely/lido-withdrawals-automation.svg)](https://github.com/Stakely/lido-withdrawals-automation/stargazers)

# Lido Withdrawals Automation by Stakely.io

Lido Withdrawals Automation is a command-line tool that assists with the LIDO validators withdrawal process. The tool streamlines the procedure by fetching validators data, generating withdrawal messages, signing them with a remote signer, encrypting the signed messages, and saving them to the output folder.

![lido_withdrawals_automation](https://user-images.githubusercontent.com/8404210/231833396-3897fa1a-1669-4652-8469-c4bf0b5a811a.png)

## Features

- Fetches validator data from the Kapi endpoint
- Creates withdrawal messages and signs them using the remote signer
- Encrypts the signed messages using the specified password
- Saves the encrypted messages to a specified output folder

## Prerequisites

- Node.js >= v18.x
- Access to a local kAPI endpoint
- Access to a web3 remote signer endpoint
- Access to a beacon node endpoint

## Installation

1. Clone the repository:

```bash
git clone https://github.com/Stakely/lido-withdrawals-automation.git
```

2. Change to the project directory:

```bash
cd lido-withdrawals-automation
```

3. Install the dependencies:

```bash
npm install
```

## Configuration

Create a `.env` file in the project root folder and set the following environment variables:

```
PERCENTAGE=<percentage_of_validators_to_withdraw>
KAPI_URL=<kapi_endpoint_url>
REMOTE_SIGNER_URL=<remote_signer_url>
PASSWORD=<password_to_encrypt_signed_messages>
OUTPUT_FOLDER=<path_to_output_folder>
OPERATOR_ID=<operator_id>
BEACON_NODE_URL=<beacon_node_url>
MODULE_ID=<module_id>
```

Replace the placeholders with your actual values. For example:

```
PERCENTAGE=10
KAPI_URL=https://example.com/kapi
REMOTE_SIGNER_URL=https://remotesigner.local:8080
PASSWORD=mysecretpassword
OUTPUT_FOLDER=/path/to/your/output-folder
OPERATOR_ID=123
BEACON_NODE_URL=http://localhost:5052
MODULE_ID=1
```

## Usage

Run the script using the following command:

```bash
npm start
```

The script will check the environment variables and prompt you for any missing values. After providing the required information, the script will fetch validator data, create withdrawal messages, sign them, encrypt the signed messages, and save them to the output folder.

## Contributing

Feel free to submit issues, feature requests, or pull requests to contribute to this project.

## About Stakely

Stakely is a professional Staking-as-a-Service company based in Spain, specializing in Proof-of-Stake blockchains. Since our launch in 2018, we have enhanced our infrastructure, monitoring, and automation systems to provide optimal performance and security measures for over 40 blockchains.

To learn more about Stakely and our services, visit [our website](https://stakely.io).

## License

This project is released under the [MIT License](https://opensource.org/licenses/MIT).

MIT License

Copyright (c) 2023 Stakely

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
