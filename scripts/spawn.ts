import { readFileSync } from 'node:fs'
import { createDataItemSigner, spawn } from '@permaweb/aoconnect'

const wallet = JSON.parse(readFileSync('./key.json').toString())
const scheduler = 'TZ7o7SIZ06ZEJ14lXwVtng1EtSx60QkPy-kh-kdAXog'
const module = 'lVj7aJVlxJburVCdN2RKQPZdQwtZob8sTVvs7CPjCpM'

;(async () => {
  console.log(
    `Spawning process from module ${module} with scheduler ${scheduler}`
  )

  const processId = await spawn({
    module,
    scheduler,
    signer: createDataItemSigner(wallet),
    tags: []
  })

  console.log(`Spawned process ${processId}`)
})().catch(console.error)


