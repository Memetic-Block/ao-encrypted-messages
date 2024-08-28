import { connect } from '@permaweb/aoconnect'

const processId = 'y_Hb1_opWoiyYI9aKuUJ934mIqekV2TfwZ3uDLVZWZg'
// const processId = 'wQ633RYuKRtpoN17-iVITM2kdgUor-47CP9FBcGv3e4'
// const processId = 'S4d1djzcJqZxLoTPZBSYkZaXgFVLt1pQvp5ZO-dJ8Nc'
const message = 'ZUWl5-FGc-TGfGR8Kfk0SJNn8Vra3XOBEzJRVdwOS1Q'
// const message = 'R_nEOxmEwaQXB9drMfx-F8xT1gWsysj1M_5IMscwvOs'

;(async () => {
  const { result } = connect({ CU_URL: 'https://cu24.ao-testnet.xyz' })
  const messageResult = await result({
    process: processId,
    message
  })

  console.log(
    `Got message ${message} for process ${processId}`,
    messageResult
  )
})().catch(console.error)

