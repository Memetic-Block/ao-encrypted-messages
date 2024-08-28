import { readFileSync } from 'node:fs'

import { EncryptedMessages } from '../..'

const processId = '_pcYbst1UY1ZD2A2b3amMcvWs4iW7-_GCXV8txc9fyw'
const wallet = JSON.parse(readFileSync('./key.json').toString())
const encryptedMessages = new EncryptedMessages(processId, wallet)

;(async () => {
  console.log(
    `Getting encryption public key on EncryptedMessages process ${processId}`
  )

  const {
    publicKey,
    messageId
  } = await encryptedMessages.getEncryptionPublicKey()

  console.log(
    `Got encryption public key ${publicKey} with message ${messageId}`
  )
})().catch(console.error)
