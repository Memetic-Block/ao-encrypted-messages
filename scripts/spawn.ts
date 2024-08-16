import { readFileSync } from 'node:fs'
import { createDataItemSigner, spawn } from '@permaweb/aoconnect'

const wallet = JSON.parse(readFileSync('./key.json').toString())
const scheduler = 'TZ7o7SIZ06ZEJ14lXwVtng1EtSx60QkPy-kh-kdAXog'
const moduleId = 'wrfmfWaeUZO-B0eWMJP5jsW7D74M8l5inkt3c2xm2GI'

;(async () => {
  console.log(
    `Spawning process from module ${moduleId} with scheduler ${scheduler}`
  )

  const processId = await spawn({
    module: moduleId,
    scheduler,
    signer: createDataItemSigner(wallet),
    tags: []
  })

  console.log(`Spawned process ${processId}`)
})().catch(console.error)


