import { IdentityUtils } from '@celo/utils'
import * as ethjsutil from 'ethereumjs-util'
// @ts-ignore
import * as Web3Utils from 'web3-utils'
import { getAttestations } from './config'

export function parseBase64(source: string) {
  return ethjsutil.bufferToHex(Buffer.from(source, 'base64'))
}

// TODO: Copied from @celo/utils, should be removed once usable as a dependency
function attestationMessageToSign(identifierHash: string, account: string) {
  const messageHash: string = Web3Utils.soliditySha3(
    { type: 'bytes32', value: identifierHash },
    { type: 'address', value: account }
  )
  return messageHash
}

// TODO: Copied from @celo/utils, should be removed once usable as a dependency
function parseSignatureAsVrs(signature: string) {
  let v: number = parseInt(signature.slice(0, 2), 16)
  const r: string = `0x${signature.slice(2, 66)}`
  const s: string = `0x${signature.slice(66, 130)}`
  if (v < 27) {
    v += 27
  }
  return { v, r, s }
}

// TODO: Copied from @celo/utils, should be removed once usable as a dependency
function parseSignatureAsRsv(signature: string) {
  const r: string = `0x${signature.slice(0, 64)}`
  const s: string = `0x${signature.slice(64, 128)}`
  let v: number = parseInt(signature.slice(128, 130), 16)
  if (v < 27) {
    v += 27
  }
  return { r, s, v }
}

// TODO: Copied from @celo/utils, should be removed once usable as a dependency
function isValidSignature(signer: string, message: string, v: number, r: string, s: string) {
  try {
    const publicKey = ethjsutil.ecrecover(
      ethjsutil.toBuffer(message),
      v,
      ethjsutil.toBuffer(r),
      ethjsutil.toBuffer(s)
    )
    const retrievedAddress = ethjsutil.bufferToHex(ethjsutil.pubToAddress(publicKey))
    return signer === retrievedAddress
  } catch (err) {
    return false
  }
}

// TODO: Copied from @celo/utils, should be removed once usable as a dependency
function parseSignature(messageHash: string, signature: string, signer: string) {
  let { r, s, v } = parseSignatureAsRsv(signature.slice(2))
  if (isValidSignature(signer, messageHash, v, r, s)) {
    return { v, r, s }
  }

  ;({ r, s, v } = parseSignatureAsVrs(signature.slice(2)))
  if (isValidSignature(signer, messageHash, v, r, s)) {
    return { v, r, s }
  }

  throw new Error('Unable to parse signature')
}

export async function validateRequest(
  identifier: string,
  account: string,
  message: string,
  issuer: string
) {
  const attestations = await getAttestations()
  const identifierHash = await IdentityUtils.identityHash(identifier)
  const expectedSourceMessage = attestationMessageToSign(identifierHash, account)
  const { r, s, v } = parseSignature(expectedSourceMessage, message, issuer.toLowerCase())

  try {
    const issuerFromSignature: string = await attestations.methods
      .validateAttestationCode(identifierHash, account, v, r, s)
      .call()
    return issuerFromSignature.toLowerCase() === issuer.toLowerCase()
  } catch (e) {
    console.error('Error validating attestation', e)
    return false
  }
}
