import {
  createDataItemSigner,
  message as aoMessage,
  result as aoResult,
  spawn as aoSpawn
} from '@permaweb/aoconnect'
import nacl from 'tweetnacl'
import naclUtil from 'tweetnacl-util'
import Arweave from 'arweave'

import {
  EncryptedMessageNotFoundError,
  EncryptedMessagesLuaProcessError,
  EncryptionPublicKeyNotSetError,
  MessageIdRequiredError,
  WalletNotSetError
} from '../errors'
import { JWKInterface } from '../util/jwk-interface'

export type SpawnEncryptedMessagesOptions = {
  module?: string
  scheduler?: string
  tags?: { name: string, value: string }[]
  arweave?: { host: string, port: number, protocol: string }
  appName?: string
  luaSourceTxId?: string
}

export type SendAosMessageOptions = {
  processId: string
  data?: string
  tags?: { name: string, value: string }[]
  signer: ReturnType<typeof createDataItemSigner>
}

export type SendEncryptedMessageOptions = {
  nonce?: string | Uint8Array
  secretKey?: string | Uint8Array
}

export type EncryptedMessage = {
  message: string
  nonce: string
  publicKey: string
  recipientPublicKey: string
}

export class EncryptedMessages {
  static SCHEDULER_ID = '_GQ33BkPtZrqxA84vM8Zk-N2aO0toNNu_C-l-rawrBA'
  static AOS_MODULE_ID = 'cbn0KKrBZH7hdNkNokuXLtGryrWM--PjSTBqIzw9Kkk'
  static PUBLISHED_LUA_TX_ID = 'p5zkcW3sysfkGrkN9oc_DfVNQ9PkI3hsb-8CyPeZZdg'

  static async spawn(
    wallet: JWKInterface,
    opts?: SpawnEncryptedMessagesOptions
  ): Promise<EncryptedMessages> {
    const arweave = Arweave.init({
      host: opts?.arweave?.host || 'arweave.net',
      port: opts?.arweave?.port || 443,
      protocol: opts?.arweave?.protocol || 'https'
    })
    const signer = createDataItemSigner(wallet)
    const appName = opts?.appName || '@memeticblock/ao-encrypted-messages'
    const luaSourceTxId = opts?.luaSourceTxId
      || EncryptedMessages.PUBLISHED_LUA_TX_ID

    console.debug(`Fetching LUA Source code from tx id ${luaSourceTxId}`)
    const luaSource = await arweave.transactions.getData(
      luaSourceTxId,
      { decode: true, string: true }
    ) as string

    console.debug(`Spawning new AO process`)
    const processId = await aoSpawn({
      module: opts?.module || EncryptedMessages.AOS_MODULE_ID,
      scheduler: opts?.scheduler || EncryptedMessages.SCHEDULER_ID,
      signer,
      tags: [
        ...(opts?.tags || []),
        { name: 'App-Name', value: appName }
      ]
    })

    console.debug(`Sending Eval Action of LUA Source to process ${processId}`)
    await EncryptedMessages.sendAosMessage({
      processId,
      data: luaSource,
      signer,
      tags: [
        { name: 'Action', value: 'Eval' },
        { name: 'App-Name', value: appName },
        {
          name: 'Source-Code-TX-ID',
          value: luaSourceTxId
        }
      ]
    })

    return new EncryptedMessages(processId, wallet)
  }

  static async sendAosMessage(
    { processId, data, tags, signer }: SendAosMessageOptions,
    retries = 3
  ) {
    let attempts = 0
    let lastError: Error | undefined

    while (attempts < retries) {
      try {
        console.debug(`Sending AO Message to process ${processId}`)
        const messageId = await aoMessage({
          process: processId,
          tags,
          data,
          signer
        })
    
        console.debug(
          `Fetching AO Message result ${messageId} from process ${processId}`
        )
        const result = await aoResult({
          message: messageId,
          process: processId
        })
        console.debug(`Got AO Message result ${messageId} from process ${processId}`)
        console.dir(result, { depth: null })

        return { messageId, result }
      } catch (error) {
        console.error(
          `Error sending AO Message to process ${processId}`,
          error
        )

        if (error.message.includes('500')) {
          console.debug(
            `Retrying sending AO message to process ${processId}`,
            JSON.stringify(
              { attempts, retries, error: error.message },
              undefined,
              2
            )
          )

          // NB: Sleep between each attempt with exponential backoff
          await new Promise(
            resolve => setTimeout(resolve, 2 ** attempts * 2000)
          )

          attempts++
          lastError = error
        } else throw error
      }
    }

    throw lastError
  }

  public lastSeenEncryptionPublicKey?: string
  private arweave: Arweave

  constructor(
    public readonly processId: string,
    private wallet?: JWKInterface,
    arweave?: Arweave
  ) {
    if (!arweave) {
      this.arweave = Arweave.init({
        host: 'arweave.net',
        port: 443,
        protocol: 'https'
      })
    }
  }

  setWallet(wallet: JWKInterface) {
    this.wallet = wallet
  }

  async getEncryptionPublicKey(
    tags?: { name: string, value: string }[]
  ) {
    if (!this.wallet) {
      throw new WalletNotSetError()
    }

    const { messageId, result } = await EncryptedMessages.sendAosMessage({
      processId: this.processId,
      signer: createDataItemSigner(this.wallet),
      tags: [
        { name: 'Action', value: 'Get-Encryption-Public-Key' },
        ...(tags || [])
      ]
    })

    const publicKey = result.Messages[0].Data

    this.lastSeenEncryptionPublicKey = publicKey

    return { messageId, result, publicKey }
  }

  async setEncryptionPublicKey(
    encryptionPublicKey?: string,
    tags?: { name: string, value: string }[]
  ): Promise<{
    publicKey: string,
    secretKey?: string,
    messageId: string
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

    const { messageId } = await EncryptedMessages.sendAosMessage({
      processId: this.processId,
      signer: createDataItemSigner(this.wallet),
      tags: [
        { name: 'Action', value: 'Set-Encryption-Public-Key' },
        { name: 'EncryptionPublicKey', value: publicKey },
        ...(tags || [])
      ]
    })

    this.lastSeenEncryptionPublicKey = publicKey

    return { publicKey, secretKey, messageId }
  }

  async sendEncryptedMessage(
    message: string,
    opts?: SendEncryptedMessageOptions,
    tags?: { name: string, value: string }[]
  ) {
    if (!this.wallet) {
      throw new WalletNotSetError()
    }

    const { publicKey, secretKey } = opts?.secretKey
      ? nacl.box.keyPair.fromSecretKey(
        typeof opts?.secretKey === 'string'
          ? Buffer.from(opts?.secretKey)
          : opts?.secretKey
      )
      : nacl.box.keyPair()

    const nonce = typeof opts?.nonce === 'string'
      ? Buffer.from(opts?.nonce)
      : nacl.randomBytes(nacl.box.nonceLength)

    if (!this.lastSeenEncryptionPublicKey) {
      await this.getEncryptionPublicKey()
    }

    if (!this.lastSeenEncryptionPublicKey) {
      throw new EncryptionPublicKeyNotSetError()
    }

    const encryptedMessage = nacl.box(
      naclUtil.decodeUTF8(message),
      nonce,
      naclUtil.decodeBase64(this.lastSeenEncryptionPublicKey),
      secretKey
    )
    const nonceB64 = naclUtil.encodeBase64(nonce)
    const encryptedMessageJson = JSON.stringify({
      message: naclUtil.encodeBase64(encryptedMessage),
      nonce: nonceB64,
      publicKey: naclUtil.encodeBase64(publicKey),
      recipientPublicKey: this.lastSeenEncryptionPublicKey
    })

    const { messageId, result } = await EncryptedMessages.sendAosMessage({
      processId: this.processId,
      signer: createDataItemSigner(this.wallet),
      tags: [
        { name: 'Action', value: 'Send-Encrypted-Message' },
        { name: 'Encrypted-Message-Nonce', value: nonceB64 },
        ...(tags || [])
      ],
      data: encryptedMessageJson
    })

    if (result.Error) {
      throw new EncryptedMessagesLuaProcessError(result.Error)
    }

    return { messageId, nonce: nonceB64 }
  }

  async listEncryptedMessages(
    tags?: { name: string, value: string }[]
  ) {
    if (!this.wallet) {
      throw new WalletNotSetError()
    }

    const { messageId, result } = await EncryptedMessages.sendAosMessage({
      processId: this.processId,
      signer: createDataItemSigner(this.wallet),
      tags: [
        { name: 'Action', value: 'List-Encrypted-Messages' },
        ...(tags || [])
      ]
    })

    const nonces = JSON.parse(result.Messages[0].Data as string)
    
    return { messageId, nonces }
  }

  async getEncryptedMessage(messageId: string, secretKey?: string) {
    if (!messageId) {
      throw new MessageIdRequiredError()
    }

    const {
      data: encryptedMessage
    } = await this.arweave.api.get<EncryptedMessage>(`/${messageId}`)

    if (!encryptedMessage) {
      throw new EncryptedMessageNotFoundError(messageId)
    }

    if (secretKey) {
      const decryptedMessage = nacl.box.open(
        naclUtil.decodeBase64(encryptedMessage.message),
        naclUtil.decodeBase64(encryptedMessage.nonce),
        naclUtil.decodeBase64(encryptedMessage.publicKey),
        naclUtil.decodeBase64(secretKey)
      )

      if (decryptedMessage) {
        encryptedMessage.message = Buffer.from(decryptedMessage).toString()
      }
    }

    return encryptedMessage
  }
}
