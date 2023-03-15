const assert = require("assert")
const { ethers } = require("ethers")
const { parseArgs, buildInput } = require("../src/utils")

describe("Utils Test", function test() {
  it("test `parseArgs` fn", () => {
    const expected = {
      param1: "test=abc",
      param2: "test abc",
      param3: "test",
      param4: "abc def",
      param5: "--s",
      param6: true,
    }

    const result = parseArgs([
      "--param1=test=abc",
      "--param2=test abc",
      "--param3",
      "test",
      "--param4",
      "abc def",
      "--param5=--s",
      "--param6",
    ])

    assert.deepEqual(result, expected)
  })

  it("test `buildInput` fn", async () => {
    const message = "Test message"
    const proverWallet = ethers.Wallet.fromPhrase(
      "skin spray suit torch live whip general walnut expect ankle name age"
    )
    const signature = await proverWallet.signMessage(message)

    const expected = {
      r: ["8151066191688823048", "2298294294753588601", "8756403100296482338", "7429658688652437265"],
      s: ["1173150895137459770", "2949927490875286712", "13579748206106636983", "4256606395289836365"],
      msghash: ["9938793962155148181", "8555223716804526631", "14892908806013461065", "15572251223772199794"],
      pubkey: [
        ["10451077517581520877", "14399701234944667578", "8498358644463497181", "17955485950457136263"],
        ["4203090873024149522", "4872140300847940018", "16861410834221859695", "5625485870289158607"],
      ],
    }
    const result = buildInput(signature, message, proverWallet.publicKey)

    assert.deepEqual(result, expected)
  })
})
