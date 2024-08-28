import { readFileSync } from 'node:fs'

import { EncryptedMessages } from '../..'

const processId = '_pcYbst1UY1ZD2A2b3amMcvWs4iW7-_GCXV8txc9fyw'
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
