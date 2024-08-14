import { expect } from 'chai'
import AoLoader from '@permaweb/ao-loader'
import nacl from 'tweetnacl'
import naclUtil from 'tweetnacl-util'

import {
  AO_ENV,
  createLoader,
  DEFAULT_HANDLE_OPTIONS,
  ALICE_ADDRESS,
  OWNER_ADDRESS
} from '../util/setup.js'

const encryptionKeyPair = nacl.box.keyPair()
const encryptionPublicKey = naclUtil.encodeBase64(encryptionKeyPair.publicKey)

describe('EncryptedMessages Process', async () => {
  let originalHandle: AoLoader.handleFunction,
      memory: ArrayBuffer

  beforeEach(async () => {
    const loader = await createLoader()
    originalHandle = loader.handle
    memory = loader.memory
  })

  async function handle(options = {}, mem = memory) {
    return originalHandle(
      mem,
      {
        ...DEFAULT_HANDLE_OPTIONS,
        ...options
      },
      AO_ENV
    )
  }

  it('Should allow Owner to set encryptionPublicKey', async () => {
    const result = await handle({
      From: OWNER_ADDRESS,
      Tags: [{ name: 'Action', value: 'Set-Encryption-Public-Key' }],
      Data: encryptionPublicKey
    })

    expect(result.Messages[0].Data).to.equal(encryptionPublicKey)
  })

  it('Should prevent non-owners from setting encryptionPublicKey', async () => {
    const result = await handle({
      From: ALICE_ADDRESS,
      Tags: [{ name: 'Action', value: 'Set-Encryption-Public-Key' }],
      Data: 'non-owner-public-key'
    })

    expect(result.Error).to.be.a('string')
  })

  it('Should allow anyone to read encryptionPublicKey', async () => {
    await handle({
      From: OWNER_ADDRESS,
      Tags: [{ name: 'Action', value: 'Set-Encryption-Public-Key' }],
      Data: encryptionPublicKey
    })

    const result = await handle({
      Tags: [{ name: 'Action', value: 'Get-Encryption-Public-Key' }]
    })

    expect(result.Messages[0].Data).to.equal(encryptionPublicKey)
  })

  it('Should allow anyone to send an encrypted message', async () => {
    await handle({
      From: OWNER_ADDRESS,
      Tags: [{ name: 'Action', value: 'Set-Encryption-Public-Key' }],
      Data: encryptionPublicKey
    })
    const { publicKey, secretKey } = nacl.box.keyPair()
    const message = 'hello!'
    const nonce = nacl.randomBytes(nacl.box.nonceLength)
    const encrypted = nacl.box(
      naclUtil.decodeUTF8(message),
      nonce,
      naclUtil.decodeBase64(encryptionPublicKey),
      secretKey
    )

    const result = await handle({
      Tags: [{ name: 'Action', value: 'Send-Encrypted-Message' }],
      Data: JSON.stringify({
        message: naclUtil.encodeBase64(encrypted),
        nonce: naclUtil.encodeBase64(nonce),
        publicKey: naclUtil.encodeBase64(publicKey)
      })
    })

    expect(result.Messages[0].Data).to.equal('OK')
  })

  it('Should allow anyone to get encrypted messages', async () => {
    await handle({
      From: OWNER_ADDRESS,
      Tags: [{ name: 'Action', value: 'Set-Encryption-Public-Key' }],
      Data: encryptionPublicKey
    })
    const { publicKey, secretKey } = nacl.box.keyPair()
    const message = 'hello!'
    const nonce = nacl.randomBytes(nacl.box.nonceLength)
    const encrypted = nacl.box(
      naclUtil.decodeUTF8(message),
      nonce,
      naclUtil.decodeBase64(encryptionPublicKey),
      secretKey
    )
    const encryptedMessageJson = JSON.stringify({
      message: naclUtil.encodeBase64(encrypted),
      nonce: naclUtil.encodeBase64(nonce),
      publicKey: naclUtil.encodeBase64(publicKey)
    })
    await handle({
      Tags: [{ name: 'Action', value: 'Send-Encrypted-Message' }],
      Data: encryptedMessageJson
    })

    const result = await handle({
      Tags: [{ name: 'Action', value: 'Get-Encrypted-Messages' }]
    })
    const response = result.Messages[0].Data as string
    const unescapedResponse = response.replace(/\\"/g, '"')
    expect(unescapedResponse).to.equal(`["${encryptedMessageJson}"]`)
  })
})
