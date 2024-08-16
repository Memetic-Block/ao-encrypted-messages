import { readFileSync } from 'node:fs'
// import nacl from 'tweetnacl'
// import naclUtil from 'tweetnacl-util'

import { EncryptedMessages } from '../..'

const processId = 'q_deETENI2myRccglLjmsXfdlI3E891iTmNj_dwMtcw'
const wallet = JSON.parse(readFileSync('./key.json').toString())
const encryptedMessages = new EncryptedMessages(processId, wallet)

;(async () => {
  console.log(
    `Setting encryption public key on EncryptedMessages process ${processId}`
  )

  const {
    publicKey,
    secretKey,
    messageId,
    // messageResult
  } = await encryptedMessages.setEncryptionPublicKey()

  console.log(
    `Set encryption public key ${publicKey} with secret key ${secretKey} with message ${messageId}`,
    // messageResult
  )
})().catch(console.error)
