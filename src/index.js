const fs = require("fs").promises
const winston = require("winston")
const { ethers } = require("ethers")
const snarkjs = require("snarkjs")
const { parseArgs, buildInput } = require("./utils")

const logger = winston.createLogger({
  transports: [new winston.transports.Console()],
})

async function main() {
  const args = parseArgs(process.argv.slice(2))

  if (!args.message) {
    throw new Error("Message argument missed")
  }

  // Generate a wallet for the Prover
  let proverWallet
  if (args["gen-random-wallet"]) {
    proverWallet = ethers.Wallet.createRandom()
    logger.info(`Wallet was generated randomly! Phrase used: "${proverWallet.mnemonic.phrase}"`)
  } else if (args["use-phrase"]) {
    proverWallet = ethers.Wallet.fromPhrase(args["use-phrase"])
    logger.info(`Wallet was created from provided phrase!`)
  } else {
    throw new Error("Wallet wasn't created")
  }

  if (!args.circuit) {
    throw new Error("Circuit wasm file path not provided")
  }

  if (!args.zkey) {
    throw new Error("Circuit zkey file path not provided")
  }

  if (!args.vkey) {
    throw new Error("Verification key path not provided")
  }

  const vkeyJson = JSON.parse(await fs.readFile(args.vkey))

  // generate a signature
  const signature = await proverWallet.signMessage(args.message)
  const inputJson = buildInput(signature, args.message, proverWallet.publicKey)

  process.stdout.write("Input:\n")
  process.stdout.write(JSON.stringify(inputJson, null, 2).concat("\n"))

  logger.info("Proving...")

  const { proof, publicSignals } = await snarkjs.groth16.fullProve(inputJson, args.circuit, args.zkey)

  process.stdout.write("Proof:\n")
  process.stdout.write(JSON.stringify(proof, null, 2).concat("\n"))

  logger.info("Verification...")

  const verified = await snarkjs.groth16.verify(vkeyJson, publicSignals, proof)

  if (verified) {
    logger.info("Verification OK!")
  } else {
    throw new Error("Invalid proof")
  }
}

;(async () => {
  try {
    await main()
  } catch (e) {
    logger.error(`${e.message}`)
  }

  process.exit(0)
})()
