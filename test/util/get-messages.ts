import { results } from '@permaweb/aoconnect'

// const processId = 'S4d1djzcJqZxLoTPZBSYkZaXgFVLt1pQvp5ZO-dJ8Nc'
// const processId = 'wQ633RYuKRtpoN17-iVITM2kdgUor-47CP9FBcGv3e4'
const processId = 'y_Hb1_opWoiyYI9aKuUJ934mIqekV2TfwZ3uDLVZWZg'

;(async () => {
  const resultsResponse = await results({
    process: processId,
    sort: 'ASC',
    limit: 25,
  })

  console.log(
    `Got ${resultsResponse.edges.length} messages for process ${processId}`,
    resultsResponse
  )
})().catch(console.error)

