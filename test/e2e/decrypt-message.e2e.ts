import { readFileSync } from 'node:fs'

import { EncryptedMessages } from '../..'

const processId = '5TW6sze3xuYWBDHKmP19fAdgQhebuNZ0nV0NilOpX2Y'
const wallet = JSON.parse(readFileSync('./key.json').toString())
const secretKeyB64 = readFileSync('./secret-key-base64.txt').toString()
const encryptedMessages = new EncryptedMessages(processId, wallet)

// Got 2 encrypted message nonces with message GRSk0gZ7pPsJfXi74-kynQiRIS7kR0WFH7Fx-eQ4Tcw
// {
//   g4HL7PRRLSL1RTnMixR6KHUeK39xdLNB: 'DOq-w2Jy2xiVr46GksGUMxqRL7rcI3eF23E2daqNYBc',
//   'cFPzwv5Xev9XR/LqosiiVHYlqAv/aONA': 'DYZ_0Ywzv5PLEO7x6LteZI-fk1TzskRG0L1Rgb1Th2c'
// }

;(async () => {
  const messageId = 'DOq-w2Jy2xiVr46GksGUMxqRL7rcI3eF23E2daqNYBc'

  console.log(
    `Decrypting message with messageId ${messageId} from EncryptedMessages`
      + ` process ${processId}`
      + ` with secretKey ${secretKeyB64}`
  )

  const msgEncrypted = await encryptedMessages.getEncryptedMessage(messageId)

  console.log('Got EncryptedMessage', msgEncrypted)

  const msgDecrypted = await encryptedMessages.getEncryptedMessage(
    messageId,
    secretKeyB64
  )

  console.log('Got decrypted EncryptedMessage', msgDecrypted)
})().catch(console.error)
