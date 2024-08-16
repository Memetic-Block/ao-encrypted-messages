export class WalletNotSetError extends Error {
  constructor() {
    super(
      'Wallet not set.  Either provide a wallet (JWKInterface) to the'
        + ' constructor or call setWallet(wallet)'
    )
  }
}
