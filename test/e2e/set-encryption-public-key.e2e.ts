import { readFileSync } from 'node:fs'

import { EncryptedMessages } from '../..'

const processId = '5TW6sze3xuYWBDHKmP19fAdgQhebuNZ0nV0NilOpX2Y'
const wallet = JSON.parse(readFileSync('./key.json').toString())
const encryptedMessages = new EncryptedMessages(processId, wallet)

;(async () => {
  console.log(
    `Setting encryption public key on EncryptedMessages process ${processId}`
  )

  const {
    publicKey,
    secretKey,
    messageId
  } = await encryptedMessages.setEncryptionPublicKey()

  console.log(
    `Set encryption public key ${publicKey} with secret key ${secretKey}`
      + ` with message ${messageId}`
  )
})().catch(console.error)
