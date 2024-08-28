export class EncryptionPublicKeyNotSetError extends Error {
  constructor() {
    super('This EncryptedMessages process hasn\'nt had a public key set yet')
  }
}
