import { readFileSync } from 'node:fs'

import { EncryptedMessages } from '../../lib/node'
import nacl from 'tweetnacl'
import naclUtil from 'tweetnacl-util'

const wallet = JSON.parse(readFileSync('./key.json').toString())

;(async () => {
  console.log(`Spawning new EncryptedMessages process`)
const encryptionKeyPair = nacl.box.keyPair()
const encryptionPublicKey = naclUtil.encodeBase64(encryptionKeyPair.publicKey)
const encryptedMessages = await EncryptedMessages.spawn(wallet, encryptionPublicKey)

  console.log(
    `Spawned new EncryptedMessages process at ${encryptedMessages.processId}`
  )
})().catch(console.error)
