import { readFileSync } from 'node:fs'

import { EncryptedMessages } from '../../lib/node'

const wallet = JSON.parse(readFileSync('./key.json').toString())

;(async () => {
  console.log(`Spawning new EncryptedMessages process`)
  const encryptedMessages = await EncryptedMessages.spawn(wallet)

  console.log(
    `Spawned new EncryptedMessages process at ${encryptedMessages.processId}`
  )
})().catch(console.error)
