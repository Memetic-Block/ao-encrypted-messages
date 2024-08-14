import fs from 'fs'
import path from 'path'
import AoLoader from '@permaweb/ao-loader'

export const MODULE_NAME = 'Encrypted-Messages'
export const OWNER_ADDRESS = ''.padEnd(43, '1')
export const ALICE_ADDRESS = ''.padEnd(42, 'a')
export const PROCESS_ID = ''.padEnd(43, '1')
export const MODULE_ID = ''.padEnd(43, '1')
export const DEFAULT_MODULE_ID = ''.padEnd(43, '1')
export const DEFAULT_TARGET = ''.padEnd(43, '1')

export const AO_ENV = {
  Process: {
    Id: PROCESS_ID,
    Owner: OWNER_ADDRESS,
    Tags: [
      // { name: 'Authority', value: 'XXXXXX' }
    ],
  },
  Module: {
    Id: MODULE_ID,
    Owner: OWNER_ADDRESS,
    Tags: [
      { name: 'Authority', value: 'YYYYYY' }
    ],
  }
}

const AOS_WASM = fs.readFileSync(
  path.join(
    path.resolve(),
    './test/util/aos-cbn0KKrBZH7hdNkNokuXLtGryrWM--PjSTBqIzw9Kkk.wasm'
  )
)

export const DEFAULT_HANDLE_OPTIONS = {
  Id: DEFAULT_MODULE_ID,
  ['Block-Height']: '1',
  // NB: Important to set the address so that that `Authority` check passes.
  //     Else the `isTrusted` with throw an error.
  Owner: OWNER_ADDRESS,
  Module: MODULE_NAME,
  Target: DEFAULT_TARGET,
  Timestamp: Date.now()
}

const BUNDLED_SOURCE = fs.readFileSync(
  path.join(path.resolve(), './dist/bundled.lua'),
  'utf-8',
)

export async function createLoader() {
  const handle = await AoLoader(AOS_WASM, {
    format: 'wasm64-unknown-emscripten-draft_2024_02_15',
    inputEncoding: 'JSON-1',
    outputEncoding: 'JSON-1',
    memoryLimit: '524288000', // in bytes
    computeLimit: (9e12).toString(),
    extensions: []
  })

  const programs = [
    {
      action: 'Eval',
      args: [{ name: 'Module', value: DEFAULT_MODULE_ID }],
      Data: BUNDLED_SOURCE
    }
  ]
  let memory = null
  for (const { action, args, Data } of programs) {
    await handle(
      memory,
      {
        ...DEFAULT_HANDLE_OPTIONS,
        Tags: [
          ...args,
          { name: 'Action', value: action }
        ],
        Data
      },
      AO_ENV
    )
  }

  return { handle, memory }
}
