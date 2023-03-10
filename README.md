# Example of circuit which verifies signature of message by provided public key

# Prerequisites

## Circom installation

git clone https://github.com/iden3/circom.git
cd circom && cargo build --release && cargo install --path circom

# Installation

## Update required submodules
git submodule update --init --recursive

## Install required packages
cd circom-ecdsa && npm install && cd .. && npm install

# Usage

## Run a test
npm test
