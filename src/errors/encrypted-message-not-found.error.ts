export class EncryptedMessageNotFoundError extends Error {
  constructor(nonceOrMessageId: string) {
    super(
      `Could not fetch Encrypted Message with messageId ${nonceOrMessageId}`
    )
  }
}
