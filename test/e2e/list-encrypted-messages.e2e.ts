import { readFileSync } from 'node:fs'

import { EncryptedMessages } from '../..'

const processId = '5TW6sze3xuYWBDHKmP19fAdgQhebuNZ0nV0NilOpX2Y'
const wallet = JSON.parse(readFileSync('./key.json').toString())
const encryptedMessages = new EncryptedMessages(processId, wallet)

;(async () => {
  console.log(
    `Listing encrypted messages from EncryptedMessages process ${processId}`
  )

  const { messageId, nonces } = await encryptedMessages.listEncryptedMessages()

  console.log(
    `Got ${Object.keys(nonces).length} encrypted message nonces`
      + ` with message ${messageId}`
  )
  console.log(nonces)
})().catch(console.error)
