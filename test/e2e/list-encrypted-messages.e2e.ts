import { readFileSync } from 'node:fs'

import { EncryptedMessages } from '../..'

const processId = '5TW6sze3xuYWBDHKmP19fAdgQhebuNZ0nV0NilOpX2Y'
const wallet = JSON.parse(readFileSync('./key.json').toString())
const encryptedMessages = new EncryptedMessages(processId, wallet)

;(async () => {
  console.log(
    `Listing encrypted messages from EncryptedMessages process ${processId}`
  )

  const {
    messageId,
    messages
  } = await encryptedMessages.listEncryptedMessages()

  console.log(
    `Got ${Object.keys(messages).length} encrypted messages`
      + ` with message ${messageId}`
  )
  console.log(messages)
})().catch(console.error)
