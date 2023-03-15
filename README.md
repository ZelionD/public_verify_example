# Example of circuit which verifies signature of message by provided public key

# Prerequisites

- Rust (latest stable)
- Circom
- Node.js (latest stable)
- NPM (latest stable)

## Circom installation

git clone https://github.com/iden3/circom.git
cd circom && cargo build --release && cargo install --path circom

# Installation

## Update required submodules

git submodule update --init --recursive

## Install required packages

cd circom-ecdsa && npm install && cd .. && npm install

# Preparation

## Required files

### Prepare PowerOfTau Ceremony

Minimum required power for `.ptau` file is `21` (`verify.circom` has ~1.5m constraints).

#### Custom .ptau file

Howto prepare `.ptau` file could be found in guide here <https://github.com/iden3/snarkjs> starting from `Step 1` to `Step 8` (inclusive)

#### Pre-built .ptau file

Pre-built final `.ptau` files could be found in `NOTE` section right after `Step 7`

### Compile circuit

Howto compile circuit could be found in guide here <https://github.com/iden3/snarkjs> in `Step 10`

### Prepare .zkey file

Howto prepare `.zkey` file and export it to `.json` file could be found in guide here <https://github.com/iden3/snarkjs> starting from `Step 15` to `Step 22` (inclusive).
This example currently supports only Groth16 proving system.

# Usage

## Run

node ./src/index.js --message="%MESSAGE%" --gen-random-wallet --circuit %CIRCUIT_WASM_PATH% --zkey %ZKEY_PATH% --vkey %VERIFICATION_KEY_PATH%

where:
`%MESSAGE%` - any message which should be signed and verified
`%CIRCUIT_WASM_PATH%` - path to built circuit wasm file
`%ZKEY_PATH%` - path to prepared `.zkey` file (could be created during PowersOfTau Ceremony)
`%VERIFICATION_KEY_PATH%` - path to exported verification key file in JSON format (should be exported from zkey file)

### Supported command line arguments

`--message`: provides any text message for signing and verification
`--gen-random-wallet`: generates etherium wallet randomly to be used later for signing
`--use-phrase`: creates wallet using provided words phrase
`--circuit`: path to compiled circuit `.wasm` file (usually located at `./verify_js/` directory)
`--zkey`: path to prepared `.zkey` file
`--vkey`: path to exported verification key file (could be exported from `.zkey` file by using `snarkjs`)

## Run a test

npm test
