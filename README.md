# AO Encrypted Messages
Send encrypted messages on AO.  Like an encrypted voicemail.

Useful for collecting private DAPP logs from users at their discretion!

## Install
```bash
npm i @memetic-block/ao-encrypted-messages
```

## Features
- Deploy, update, & view an encrypted inbox on AO!
- Programmatic interface
- Supports `Curve25519`
- Uses `tweetnacl` under the hood for encryption

## Programmatic Usage

### 1) Spawn a new Encrypted Inbox
```typescript
const wallet = JSON.parse(readFileSync('path-to-jwk').toString())

const encryptedMessages = await EncryptedMessages.spawn(wallet)

console.log(`Spawned new EncryptedMessages process at ${encryptedMessages.processId}`)
```

### 2) Set the Encryption Public Key (required!)
A newly spawned Encrypted Inbox doesn't have a public key to receive messages so
one needs to be set before it can receive messages.

You can update the Encryption Public Key as often as you want!  Old messages will still be retained with the public key they were originally sent with.
```typescript
const publicKey = 'your Curve25519 PUBLIC key'
const result = await encryptedMessages.setEncryptionPublicKey(publicKey)

console.log(
  `Set encryption key ${result.publicKey} on EncryptedMessage process ${encryptedMessages.processId}`,
  result
)
```

### 3) Send an Encrypted Message
Send an encrypted message with a generated throw-away keypair
```typescript
const message = "Hold the line, love isn't always on time"
const { messageId } = await encryptedMessages.sendEncryptedMessage(message)
```

Send an encrypted message with a given keypair and nonce - both optional.
```typescript
const secretKey = 'your Curve25519 PRIVATE key'
const nonce = 'Quis custodiet ipsos custodes?'
const { messageId } = await encryptedMessages.sendEncryptedMessage(
  message,
  { secretKey, nonce }
)
```

### 4) List Encrypted Messages
List all messages contained in the process.  They are still encrypted.
```typescript
const { messages } = await encryptedMessages.listEncryptedMessages()

console.log(`Got ${Object.keys(messages).length} encrypted messages`)
console.log(messages)
```

### 5) Read an Encrypted Message
Fetch an individual encrypted message by its AO message ID.
It's still encrypted.
```typescript
const {
  message,
  nonce,
  publicKey,
  recipientPublicKey
} = await encryptedMessages.getEncryptedMessage(messageId)
```

Optionally, you can supply the secret key to automatically decrypt a fetched message.
```typescript
const secretKey = 'your Curve25519 PRIVATE key'
const {
  message,
  nonce,
  publicKey,
  recipientPublicKey
} = await encryptedMessages.getEncryptedMessage(messageId, secretKey)
```

## Contributing
PRs welcome!
