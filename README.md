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

- Node.js >= v22.x
- pnpm (the repository pins the version in the `packageManager` field, so `corepack enable` is enough)
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
pnpm install
```

## Configuration

Create a `.env` file in the project root folder and set the following environment variables:

```
WITHDRAWALS_SCOPE=<modules_to_operators_mapping>
KAPI_URL=<kapi_endpoint_url>
REMOTE_SIGNER_URL=<remote_signer_url>
PASSWORD=<password_to_encrypt_signed_messages>
OUTPUT_FOLDER=<path_to_output_folder>
BEACON_NODE_URL=<beacon_node_url>
MISSING_KEYS_TOLERANCE=<missing_keys_tolerance>
```

Replace the placeholders with your actual values. For example:

```
WITHDRAWALS_SCOPE={"1":[{"id":123,"percent":50}],"4":[{"id":0,"percent":10},{"id":1,"percent":10}]}
KAPI_URL=https://example.com/kapi
REMOTE_SIGNER_URL=https://remotesigner.local:8080
PASSWORD=mysecretpassword
OUTPUT_FOLDER=/path/to/your/output-folder
BEACON_NODE_URL=http://localhost:5052
MISSING_KEYS_TOLERANCE=0
```

### `WITHDRAWALS_SCOPE`

`WITHDRAWALS_SCOPE` lets you process several staking modules and operators in a single run. It is a JSON object where:

- The **key** is the staking module ID.
- The **value** is a non-empty array of operators, each one an object with:
  - `id`: the operator ID, an integer `>= 0` (`0` is allowed).
  - `percent`: the percentage of that operator's validators to withdraw, an integer between `1` and `100`.

Each module/operator pair is fetched from the KAPI independently with its own `percent`, so `WITHDRAWALS_SCOPE={"1":[{"id":123,"percent":50}],"4":[{"id":0,"percent":10}]}` withdraws 50% of operator 123 in module 1 and 10% of operator 0 in module 4.

`MISSING_KEYS_TOLERANCE` is global and applied per pair. The output stays flat in `OUTPUT_FOLDER` (file names are unchanged). Signatures are encrypted once at the end, so if any pair fails the whole process aborts without writing partial output.

### Deprecated variables

`MODULE_ID`, `OPERATOR_ID` and `PERCENTAGE` are deprecated and will be removed in a future version. They still work as a single-pair fallback: when all three are set (and `WITHDRAWALS_SCOPE` is not), the tool prints a deprecation warning and maps them internally to `{"<MODULE_ID>":[{"id":<OPERATOR_ID>,"percent":<PERCENTAGE>}]}`. Note the legacy `OPERATOR_ID` still requires a value `> 0`, while `WITHDRAWALS_SCOPE` allows operator `id` `0`.

Setting `WITHDRAWALS_SCOPE` **together with** any of `MODULE_ID`/`OPERATOR_ID`/`PERCENTAGE` makes the tool exit with an error: use only one of the two approaches.

## Usage

Run the script using the following command:

```bash
pnpm start
```

The script will check the environment variables and prompt you for any missing values. If neither `WITHDRAWALS_SCOPE` nor the deprecated trio is set, the interactive prompts ask for a single module ID, operator ID and percentage. After providing the required information, the script will fetch validator data, create withdrawal messages, sign them, encrypt the signed messages, and save them to the output folder.

## Contributing

Feel free to submit issues, feature requests, or pull requests to contribute to this project.

## About Stakely

Stakely is a professional Staking-as-a-Service company based in Spain, specializing in Proof-of-Stake blockchains. Since our launch in 2018, we have enhanced our infrastructure, monitoring, and automation systems to provide optimal performance and security measures for over 40 blockchains.

To learn more about Stakely and our services, visit [our website](https://stakely.io).

## License

This project is released under the [MIT License](https://opensource.org/licenses/MIT).

MIT License

Copyright (c) 2025 Stakely

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
