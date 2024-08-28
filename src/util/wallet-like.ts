import { DataItem } from './data-item'
import { JWKInterface } from './jwk-interface'

export type WalletLike =
  | JWKInterface
  | { signDataItem(dataItem: DataItem): Promise<ArrayBufferLike> }
