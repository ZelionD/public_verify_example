const { ethers } = require("ethers")
const secp = require("@noble/secp256k1")

function convertBigintToArray(n, k, x) {
  let mod = 1n
  for (let idx = 0; idx < n; idx += 1) {
    mod *= 2n
  }

  const ret = []
  let xTemp = x
  for (let idx = 0; idx < k; idx += 1) {
    ret.push((xTemp % mod).toString())
    xTemp /= mod
  }
  return ret
}

function convertSignatureToRSArrays(sig) {
  const rArr = convertBigintToArray(64, 4, BigInt(`0x${sig.slice(2, 2 + 64)}`)).map((el) => el.toString())
  const sArr = convertBigintToArray(64, 4, BigInt(`0x${sig.slice(66, 66 + 64)}`)).map((el) => el.toString())

  return [rArr, sArr]
}

function convertPubkeyToXYArrays(pk) {
  const { x, y } = secp.Point.fromHex(pk.slice(2))

  const xArr = convertBigintToArray(64, 4, x).map((el) => el.toString())
  const yArr = convertBigintToArray(64, 4, y).map((el) => el.toString())

  return [xArr, yArr]
}

function convertToMessageHashArrays(message) {
  return convertBigintToArray(64, 4, BigInt(ethers.hashMessage(message)))
}

function buildInput(signature, message, signerPubkey) {
  const [r, s] = convertSignatureToRSArrays(signature)

  return {
    r,
    s,
    msghash: convertToMessageHashArrays(message),
    pubkey: convertPubkeyToXYArrays(signerPubkey),
  }
}

module.exports = { buildInput }
