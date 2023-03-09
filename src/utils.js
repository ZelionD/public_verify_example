const { ethers } = require("ethers")

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

// utils From https://github.com/personaelabs/heyanon
function sigToRSArrays(sig) {
  const rArr = convertBigintToArray(64, 4, BigInt(`0x${sig.slice(2, 2 + 64)}`)).map((el) => el.toString())
  const sArr = convertBigintToArray(64, 4, BigInt(`0x${sig.slice(66, 66 + 64)}`)).map((el) => el.toString())

  return [rArr, sArr]
}

function powMod(base, exponent, modulus) {
  let exponentTmp = exponent
  let result = 1n
  let baseMod = base % modulus
  while (exponentTmp > 0n) {
    if (exponentTmp % 2n === 1n) {
      result = (result * baseMod) % modulus
    }
    baseMod = baseMod ** 2n % modulus
    exponentTmp /= 2n
  }
  return result
}

function modularSqrt(a, p) {
  const pMinusOneOver2 = (p - 1n) / 2n
  if (powMod(a, pMinusOneOver2, p) !== 1n) {
    return null
  }
  let s = p - 1n
  let e = 0n
  while (s % 2n === 0n) {
    s /= 2n
    e += 1n
  }
  let n = 2n
  while (powMod(n, pMinusOneOver2, p) !== p - 1n) {
    n += 1n
  }
  let x = powMod(a, (s + 1n) / 2n, p)
  let b = powMod(a, s, p)
  let g = powMod(n, s, p)
  let r = e
  while (true) {
    let t = b
    let m = 0n
    for (let i = 0n; i < r; i += 1) {
      if (t === 1n) {
        m = i
        break
      }
      t = t ** 2n % p
    }
    if (m === 0n) {
      return x
    }
    const gs = powMod(g, BigInt(2 ** (r - m - 1)), p)
    x = (x * gs) % p
    b = (b * gs * gs) % p
    g = (gs * gs) % p
    r = m
  }
}

function getXYFromPublicKey(publicKey) {
  const prefix = publicKey.slice(0, 2)

  let x
  let y

  if (prefix === "04") {
    // Uncompressed public key
    x = BigInt(`0x${publicKey.slice(2, 34)}`)
    y = BigInt(`0x${publicKey.slice(34)}`)
  } else {
    // Compressed public key
    const sign = prefix === "03" ? "odd" : "even"
    const p = BigInt("0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f")
    x = BigInt(`0x${publicKey.slice(2)}`)
    const ySquared = (x ** 3n + 7n) % p
    y = modularSqrt(ySquared, p)
    if (sign === "odd") {
      y = p - y
    }
  }

  return { x, y }
}

// Utils from https://github.com/personaelabs/heyanon
function pubkeyToXYArrays(pk) {
  const { x, y } = getXYFromPublicKey(pk.slice(2))

  const xArr = convertBigintToArray(64, 4, x).map((el) => el.toString())
  const yArr = convertBigintToArray(64, 4, y).map((el) => el.toString())

  return [xArr, yArr]
}

// Utils from https://github.com/personaelabs/heyanon
function msgToMsgHashInput(message) {
  return convertBigintToArray(64, 4, BigInt(ethers.hashMessage(message)))
}

function buildInput(signature, message, signerPubkey) {
  const [r, s] = sigToRSArrays(signature)

  return {
    r,
    s,
    msghash: msgToMsgHashInput(message),
    pubkey: pubkeyToXYArrays(signerPubkey),
  }
}

module.exports = { buildInput }
