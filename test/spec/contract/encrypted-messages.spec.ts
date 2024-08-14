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
} from '../../util/setup'

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

    expect(result.Error)
      .to.be.a('string')
      .that.includes('This action is only available to the process Owner')
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
    const nonceB64 = naclUtil.encodeBase64(nonce)

    const result = await handle({
      Tags: [{ name: 'Action', value: 'Send-Encrypted-Message' }],
      Data: JSON.stringify({
        message: naclUtil.encodeBase64(encrypted),
        nonce: nonceB64,
        publicKey: naclUtil.encodeBase64(publicKey),
        recipientPublicKey: encryptionPublicKey
      })
    })

    expect(result.Messages[0].Data).to.equal(nonceB64)
  })

  it('Should validated encrypted messages', async () => {
    await handle({
      From: OWNER_ADDRESS,
      Tags: [{ name: 'Action', value: 'Set-Encryption-Public-Key' }],
      Data: encryptionPublicKey
    })

    const nonJsonResult = await handle({
      Tags: [{ name: 'Action', value: 'Send-Encrypted-Message' }],
      Data: 'this-is-not-json'
    })
    expect(nonJsonResult.Error).to.be.a('string')

    const noNonceResult = await handle({
      Tags: [{ name: 'Action', value: 'Send-Encrypted-Message' }],
      Data: JSON.stringify({
        message: 'message',
        publicKey: 'publicKey'
      })
    })
    expect(noNonceResult.Error).to.be.a('string')

    const noMessageResult = await handle({
      Tags: [{ name: 'Action', value: 'Send-Encrypted-Message' }],
      Data: JSON.stringify({
        nonce: 'nonce',
        publicKey: 'publicKey'
      })
    })
    expect(noMessageResult.Error)
      .to.be.a('string')
      .that.includes('Invalid message')

    const noPublicKeyResult = await handle({
      Tags: [{ name: 'Action', value: 'Send-Encrypted-Message' }],
      Data: JSON.stringify({
        nonce: 'nonce',
        message: 'message'
      })
    })
    expect(noPublicKeyResult.Error)
      .to.be.a('string')
      .that.includes('Invalid publicKey')
  })

  it('Should error if encrypted message nonce has been used', async () => {
    await handle({
      From: OWNER_ADDRESS,
      Tags: [{ name: 'Action', value: 'Set-Encryption-Public-Key' }],
      Data: encryptionPublicKey
    })
    const { publicKey, secretKey } = nacl.box.keyPair()
    const message = 'hello!'
    const nonce = nacl.randomBytes(nacl.box.nonceLength)
    const nonceB64 = naclUtil.encodeBase64(nonce)
    const encrypted = nacl.box(
      naclUtil.decodeUTF8(message),
      nonce,
      naclUtil.decodeBase64(encryptionPublicKey),
      secretKey
    )
    const encryptedMessageJson = JSON.stringify({
      message: naclUtil.encodeBase64(encrypted),
      nonce: nonceB64,
      publicKey: naclUtil.encodeBase64(publicKey)
    })
    await handle({
      Tags: [{ name: 'Action', value: 'Send-Encrypted-Message' }],
      Data: encryptedMessageJson
    })
    const result = await handle({
      Tags: [{ name: 'Action', value: 'Send-Encrypted-Message' }],
      Data: encryptedMessageJson
    })

    expect(result.Error).to.be.a('string')
  })

  it('Should list encrypted message IDs', async () => {
    await handle({
      From: OWNER_ADDRESS,
      Tags: [{ name: 'Action', value: 'Set-Encryption-Public-Key' }],
      Data: encryptionPublicKey
    })
    const { publicKey, secretKey } = nacl.box.keyPair()
    const message = 'hello!'
    const nonce = nacl.randomBytes(nacl.box.nonceLength)
    const nonceB64 = naclUtil.encodeBase64(nonce)
    const nonceTwo = nacl.randomBytes(nacl.box.nonceLength)
    const nonceTwoB64 = naclUtil.encodeBase64(nonceTwo)
    const nonceThree = nacl.randomBytes(nacl.box.nonceLength)
    const nonceThreeB64 = naclUtil.encodeBase64(nonceThree)
    const encrypted = nacl.box(
      naclUtil.decodeUTF8(message),
      nonce,
      naclUtil.decodeBase64(encryptionPublicKey),
      secretKey
    )
    const encryptedMessageJson = JSON.stringify({
      message: naclUtil.encodeBase64(encrypted),
      nonce: nonceB64,
      publicKey: naclUtil.encodeBase64(publicKey),
      recipientPublicKey: encryptionPublicKey
    })
    const encryptedMessageJsonTwo = JSON.stringify({
      message: naclUtil.encodeBase64(encrypted),
      nonce: nonceTwoB64,
      publicKey: naclUtil.encodeBase64(publicKey),
      recipientPublicKey: encryptionPublicKey
    })
    const encryptedMessageJsonThree = JSON.stringify({
      message: naclUtil.encodeBase64(encrypted),
      nonce: nonceThreeB64,
      publicKey: naclUtil.encodeBase64(publicKey),
      recipientPublicKey: encryptionPublicKey
    })
    await handle({
      Tags: [{ name: 'Action', value: 'Send-Encrypted-Message' }],
      Data: encryptedMessageJson
    })
    await handle({
      Tags: [{ name: 'Action', value: 'Send-Encrypted-Message' }],
      Data: encryptedMessageJsonTwo
    })
    await handle({
      Tags: [{ name: 'Action', value: 'Send-Encrypted-Message' }],
      Data: encryptedMessageJsonThree
    })

    const result = await handle({
      Tags: [{ name: 'Action', value: 'List-Encrypted-Messages' }]
    })

    const response = result.Messages[0].Data as string
    const unescapedResponse = response.replace(/\\"/g, '"')
    const noncesB64 = [nonceB64, nonceTwoB64, nonceThreeB64].sort()
    expect(unescapedResponse).to.equal(JSON.stringify(noncesB64))
  })

  it('Should allow Owner to remove messages by IDs (nonce)', async () => {
    await handle({
      From: OWNER_ADDRESS,
      Tags: [{ name: 'Action', value: 'Set-Encryption-Public-Key' }],
      Data: encryptionPublicKey
    })
    const nonceOne = 'one'
    const nonceTwo = 'two'
    const nonceThree = 'three'
    const nonceFour = 'four'
    await handle({
      Tags: [{ name: 'Action', value: 'Send-Encrypted-Message' }],
      Data: JSON.stringify({
        nonce: nonceOne,
        message: 'message',
        publicKey: 'publicKey',
        recipientPublicKey: encryptionPublicKey
      })
    })
    await handle({
      Tags: [{ name: 'Action', value: 'Send-Encrypted-Message' }],
      Data: JSON.stringify({
        nonce: nonceTwo,
        message: 'message',
        publicKey: 'publicKey',
        recipientPublicKey: encryptionPublicKey
      })
    })
    await handle({
      Tags: [{ name: 'Action', value: 'Send-Encrypted-Message' }],
      Data: JSON.stringify({
        nonce: nonceThree,
        message: 'message',
        publicKey: 'publicKey',
        recipientPublicKey: encryptionPublicKey
      })
    })
    await handle({
      Tags: [{ name: 'Action', value: 'Send-Encrypted-Message' }],
      Data: JSON.stringify({
        nonce: nonceFour,
        message: 'message',
        publicKey: 'publicKey',
        recipientPublicKey: encryptionPublicKey
      })
    })

    const result = await handle({
      From: OWNER_ADDRESS,
      Tags: [{ name: 'Action', value: 'Remove-Encrypted-Messages' }],
      Data: JSON.stringify([nonceTwo, nonceThree])
    })

    expect(result.Messages[0].Data).to.equal(
      JSON.stringify([nonceTwo, nonceThree])
    )

    const listResult = await handle({
      Tags: [{ name: 'Action', value: 'List-Encrypted-Messages' }]
    })

    const response = listResult.Messages[0].Data as string
    const unescapedResponse = response.replace(/\\"/g, '"')
    const nonces = [nonceOne, nonceFour].sort()
    expect(unescapedResponse).to.equal(JSON.stringify(nonces))
  })

  it('Should prevent non-Owners from removing messages', async () => {
    const result = await handle({
      From: ALICE_ADDRESS,
      Tags: [{ name: 'Action', value: 'Remove-Encrypted-Messages' }],
      Data: JSON.stringify(['nonce'])
    })

    expect(result.Error)
      .to.be.a('string')
      .that.includes('This action is only available to the process Owner')
  })

  it('Should require the recipient public key with messages', async () => {
    await handle({
      From: OWNER_ADDRESS,
      Tags: [{ name: 'Action', value: 'Set-Encryption-Public-Key' }],
      Data: encryptionPublicKey
    })

    const result = await handle({
      Tags: [{ name: 'Action', value: 'Send-Encrypted-Message' }],
      Data: JSON.stringify({
        message: 'message',
        nonce: 'nonce',
        publicKey: 'publicKey'
      })
    })

    expect(result.Error)
      .to.be.a('string')
      .that.includes('Invalid recipientPublicKey')
  })

  it('Allows fetching an encrypted message by id (nonce)', async () => {
    await handle({
      From: OWNER_ADDRESS,
      Tags: [{ name: 'Action', value: 'Set-Encryption-Public-Key' }],
      Data: encryptionPublicKey
    })

    const nonces = ['one', 'two', 'three', 'four']
    for (const nonce of nonces) {
      await handle({
        Tags: [{ name: 'Action', value: 'Send-Encrypted-Message' }],
        Data: JSON.stringify({
          message: 'message',
          nonce,
          publicKey: 'publicKey',
          recipientPublicKey: encryptionPublicKey
        })
      })
    }

    const result = await handle({
      Tags: [{ name: 'Action', value: 'Get-Encrypted-Message' }],
      Data: nonces[2]
    })

    expect(result.Messages[0].Data).to.equal(JSON.stringify({
      message: 'message',
      nonce: 'three',
      publicKey: 'publicKey',
      recipientPublicKey: encryptionPublicKey
    }))
  })
})
