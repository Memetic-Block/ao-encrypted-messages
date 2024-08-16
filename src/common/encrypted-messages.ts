import { createDataItemSigner, spawn } from '@permaweb/aoconnect'

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
  static SCHEDULER = 'TZ7o7SIZ06ZEJ14lXwVtng1EtSx60QkPy-kh-kdAXog'

  static async spawn(
    wallet: JWKInterface,
    opts?: EncryptedMessagesSpawnOptions
  ): Promise<EncryptedMessages> {
    const processId = await spawn({
      module: opts?.module || EncryptedMessages.MODULE_ID,
      scheduler: opts?.scheduler || EncryptedMessages.SCHEDULER,
      signer: createDataItemSigner(wallet),
      tags: opts?.tags
    })

    return new EncryptedMessages(processId)
  }

  constructor(
    public readonly processId: string
  ) {}
}
