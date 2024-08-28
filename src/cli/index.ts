import { program } from 'commander'
import { readFileSync } from 'node:fs'

import { EncryptedMessages } from '../common/encrypted-messages'

program.command('spawn')
  .description('Spawn a new EncryptedMessages process')
  .requiredOption('-w, --wallet <path-to-jwk>', 'wallet is required')
  .action(async args => {
    const wallet = JSON.parse(readFileSync(args.wallet).toString())

    console.log(`Spawning new EncryptedMessages process`)
    const encryptedMessages = await EncryptedMessages.spawn(wallet)

    console.log(
      `Spawned new EncryptedMessages process at ${encryptedMessages.processId}`
    )
  })

program.command('set-encryption-key')
  .description('Set the encryption public key on an EncryptedMessage process')
  .requiredOption('-w, --wallet <path-to-jwk>', 'wallet is required')
  .requiredOption('-p, --process <process-id>', 'process id is required')
  .option('-pk, --publickey', 'The encryption public key to set')
  .action(async args => {
    const wallet = JSON.parse(readFileSync(args.wallet).toString())
    const encryptedMessages = new EncryptedMessages(args.process, wallet)

    console.log(
      `Setting encryption key ${args.publickey}`
        + ` on EncryptedMessage process ${args.process}`
    )

    const result = await encryptedMessages.setEncryptionPublicKey(
      args.publickey
    )

    console.log(
      `Set encryption key ${result.publicKey}`
        + ` on EncryptedMessage process ${args.process}`,
      result
    )
  })

program.command('get-encryption-key')
  .description(
    'Get the encryption public key froim an EncryptedMessage process'
  )
  .requiredOption('-w, --wallet <path-to-jwk>', 'wallet is required')
  .requiredOption('-p, --process <process-id>', 'process id is required')
  .action(async args => {
    const wallet = JSON.parse(readFileSync(args.wallet).toString())
    const encryptedMessages = new EncryptedMessages(args.process, wallet)

    console.log(
      `Getting encryption key from EncryptedMessage process ${args.process}`
    )

    const {
      publicKey,
      messageId
    } = await encryptedMessages.getEncryptionPublicKey()

    console.log(
      `Got encryption public key ${publicKey} with message ${messageId}`
    )
  })

program.command('send-encrypted-message')
  .description('Send a message to the EncryptedMessage process')
  .requiredOption('-w, --wallet <path-to-jwk>', 'wallet is required')
  .requiredOption('-p, --process <process-id>', 'process id is required')
  .option(
    '-sk, --secretkey',
    'optional secret key to use for encryption - will be generated if undefined'
  )
  .option(
    '-n, --nonce',
    'optional nonce to use for encryption - will be generated if undefined'
  )
  .argument('<message>', 'The message to encrypt and send')
  .action(async (message, opts) => {
    const wallet = JSON.parse(readFileSync(opts.wallet).toString())
    const encryptedMessages = new EncryptedMessages(opts.process, wallet)

    console.log(`Sending message to EncryptedMessage process ${opts.process}`)

    const { messageId } = await encryptedMessages.sendEncryptedMessage(
      message,
      { secretKey: opts.secretkey, nonce: opts.nonce }
    )

    console.log(`Sent message ${messageId} to process ${opts.process}`)
  })

program.command('list-encrypted-messages')
  .description('List encrypted messages sent to the EncryptedMessage process')
  .requiredOption('-w, --wallet <path-to-jwk>', 'wallet is required')
  .requiredOption('-p, --process <process-id>', 'process id is required')
  .action(async args => {
    const wallet = JSON.parse(readFileSync(args.wallet).toString())
    const encryptedMessages = new EncryptedMessages(args.process, wallet)

    console.log(
      `Listing encrypted messages from EncryptedMessage process ${args.process}`
    )

    const { messages, messageId } = await encryptedMessages.listEncryptedMessages()

    console.log(
      `Got ${Object.keys(messages).length} encrypted messages`
        + ` with message ${messageId}`
    )
    console.log(messages)
  })

program.command('get-encrypted-message')
  .description('Gets an encrypted message and optionally decrypts it')
  .requiredOption('-w, --wallet <path-to-jwk>', 'wallet is required')
  .requiredOption('-p, --process <process-id>', 'process id is required')
  .requiredOption(
    '-m, --message <message-id>',
    'message id of the original encrypted message'
  )
  .option(
    '-sk, --secretkey <secret-key>',
    'optional secret key to decrypt messages with'
  )
  .action(async args => {
    const wallet = JSON.parse(readFileSync(args.wallet).toString())
    const encryptedMessages = new EncryptedMessages(args.process, wallet)

    console.log(
      `Getting message with messageId ${args.message} from EncryptedMessages`
        + ` process ${args.process}`
        + ` with secretKey ${args.secretkey}`
    )

    const {
      message,
      nonce,
      publicKey,
      recipientPublicKey
    } = await encryptedMessages.getEncryptedMessage(
      args.message,
      args.secretkey
    )

    console.log(
      'Got EncryptedMessage',
      '\nnonce', nonce,
      '\npublicKey', publicKey,
      '\nrecipientPublicKey', recipientPublicKey,
      '\nmessage', message
    )
  })

program.parse()
