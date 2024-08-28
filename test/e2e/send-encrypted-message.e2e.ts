import { readFileSync } from 'node:fs'

import { EncryptedMessages } from '../..'

const processId = '5TW6sze3xuYWBDHKmP19fAdgQhebuNZ0nV0NilOpX2Y'
const wallet = JSON.parse(readFileSync('./key.json').toString())
const encryptedMessages = new EncryptedMessages(processId, wallet)

;(async () => {
  const message = '<BUY THIS AD SPACE>'

  console.log(
    `Sending encrypted message "${message}" to EncryptedMessages`
      + ` process ${processId}`
  )

  const { messageId, nonce } = await encryptedMessages.sendEncryptedMessage(
    message
  )

  console.log(`Sent encrypted message ${messageId} with nonce ${nonce}`)
})().catch(console.error)
