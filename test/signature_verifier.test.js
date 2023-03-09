const path = require("path")
const wasmTester = require("circom_tester").wasm
const { ethers } = require("ethers")
const { buildInput } = require("../src/utils")

describe("Signature Verifier Test", function test() {
  // increase test timeout to give enough time for prooving
  this.timeout("60m")

  // Generate a wallet for the Prover
  const proverWallet = ethers.Wallet.createRandom()

  // message to be signed
  const message = "TestSignatureVerifier"

  describe("Verify Signature", () => {
    it("verify valid signature", async () => {
      const circuit = await wasmTester(path.join(__dirname, "../circuits", "verify.circom"))

      // generate a signature
      const signature = await proverWallet.signMessage(message)

      const input = buildInput(signature, message, proverWallet.publicKey)
      // console.log(JSON.stringify(input))

      const witness = await circuit.calculateWitness(input)

      // Evaluate witness to output
      await circuit.assertOut(witness, { out: "1" })
      await circuit.checkConstraints(witness)
    })

    it("verify invalid signature", async () => {
      const circuit = await wasmTester(path.join(__dirname, "../circuits", "verify.circom"))

      // generate a signature from different message
      const signature = await proverWallet.signMessage(`${message}1`)

      const input = buildInput(signature, message, proverWallet.publicKey)

      const witness = await circuit.calculateWitness(input)

      // Evaluate witness to output
      await circuit.assertOut(witness, { out: "0" })
      await circuit.checkConstraints(witness)
    })
  })
})
