export class MessageIdRequiredError extends Error {
  constructor() {
    super('Missing messageId when fetching an encrypted message')
  }
}
