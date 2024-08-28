export class EncryptedMessagesLuaProcessError extends Error {
  constructor(luaErrorMessage?: string) {
    super(`Error from EncryptedMessages LUA process: ${luaErrorMessage}`)
  }
}
