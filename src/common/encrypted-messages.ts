import {
  createDataItemSigner,
  message as aoMessage,
  result as aoResult,
  spawn as aoSpawn
} from '@permaweb/aoconnect'
import { MessageResult } from '@permaweb/aoconnect/dist/lib/result'
import nacl from 'tweetnacl'
import naclUtil from 'tweetnacl-util'

import { WalletNotSetError } from '../errors/wallet-not-set.error'
import { JWKInterface } from '../util/jwk-interface'


export type EncryptedMessagesSpawnOptions = {
  module?: string,
  scheduler?: string,
  tags?: {
    name: string
    value: string
  }[]
}

export class EncryptedMessages {
  static MODULE_ID = 'wrfmfWaeUZO-B0eWMJP5jsW7D74M8l5inkt3c2xm2GI'
  static SCHEDULER = '_GQ33BkPtZrqxA84vM8Zk-N2aO0toNNu_C-l-rawrBA'

  static async spawn(
    wallet: JWKInterface,
    encryptionPublicKey: string,
    opts?: EncryptedMessagesSpawnOptions
  ): Promise<EncryptedMessages> {
    const processId = await aoSpawn({
      module: opts?.module || EncryptedMessages.MODULE_ID,
      scheduler: opts?.scheduler || EncryptedMessages.SCHEDULER,
      signer: createDataItemSigner(wallet),
      tags: [
        ...opts?.tags,
      {name: 'EncryptionPublicKey', value: encryptionPublicKey}
      ]
    })

    return new EncryptedMessages(processId, wallet)
  }

  constructor(
    public readonly processId: string,
    private wallet?: JWKInterface
  ) {}

  setWallet(wallet: JWKInterface) {
    this.wallet = wallet
  }

  async setEncryptionPublicKey(
    encryptionPublicKey?: string,
    tags?: { name: string, value: string }[]
  ): Promise<{
    publicKey: string,
    secretKey?: string,
    messageId: string,
    // messageResult: MessageResult
  }> {
    if (!this.wallet) {
      throw new WalletNotSetError()
    }

    let publicKey = encryptionPublicKey
    let secretKey: string

    if (!publicKey) {
      const keyPair = nacl.box.keyPair()
      publicKey = naclUtil.encodeBase64(keyPair.publicKey)
      secretKey = naclUtil.encodeBase64(keyPair.secretKey)
    }

    const messageOpts = {
      process: this.processId,
      signer: createDataItemSigner(this.wallet),
      tags: [
        { name: 'Action', value: 'Set-Encryption-Public-Key' },
        { name: 'EncryptionPublicKey', value: publicKey },
        ...(tags || [])
      ]
    }

    const messageId = await aoMessage(messageOpts)
    // const messageResult = await aoResult({
    //   message: messageId,
    //   process: this.processId
    // })

    return { publicKey, secretKey, messageId, /*messageResult*/ }
  }
}
