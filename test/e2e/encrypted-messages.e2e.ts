import { EncryptedMessages } from '../../lib/node'

import { readFileSync } from 'node:fs'
import { createDataItemSigner, message } from '@permaweb/aoconnect'
import nacl from 'tweetnacl'
import naclUtil from 'tweetnacl-util'

const wallet = JSON.parse(readFileSync('./key.json').toString())
const encryptionKeyPair = nacl.box.keyPair()
const encryptionPublicKey = naclUtil.encodeBase64(encryptionKeyPair.publicKey)

;(async () => {
  console.log(`Spawning new EncryptedMessages process`)
  const encryptedMessages = await EncryptedMessages.spawn(wallet)

  console.log(
    `Spawned new EncryptedMessages process at ${encryptedMessages.processId}`
  )
})().catch(console.error)
