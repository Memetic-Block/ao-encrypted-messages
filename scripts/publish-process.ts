import Arweave from 'arweave'
import { readFileSync } from 'fs'
import { join, resolve } from 'path'

const arweave = Arweave.init({
  host: 'arweave.net',
  port: 443,
  protocol: 'https'
})

;(async () => {
  const bundledLua = readFileSync(join(resolve(), './dist/bundled.lua'), 'utf8')
  const wallet = readFileSync(join(resolve(), './key.json'), 'utf-8')
  const jwk = JSON.parse(wallet)
  const address = await arweave.wallets.jwkToAddress(jwk)

  console.log('Creating bundled lua tx with wallet', address)
  const tx = await arweave.createTransaction({ data: bundledLua }, jwk)
  tx.addTag('App-Name', 'aos-LUA')
  tx.addTag('App-Version', '0.0.1')
  tx.addTag('Content-Type', 'text/x-lua')
  tx.addTag('Author', 'Memetic Block')

  console.log('Signing bundled lua tx')
  await arweave.transactions.sign(tx, jwk)

  console.log('Posting bundled lua tx', tx.id)
  await arweave.transactions.post(tx)

  console.log('Posted bundled lua tx', tx.id)
})().catch(err => { console.error(err); process.exitCode = 1; })
