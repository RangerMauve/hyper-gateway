const test = require('tape')
const fetch = require('node-fetch')
const getPort = require('get-port')
const HyperGateway = require('./')

test('Start up ephemeral gateway and load some data', async (t) => {
  const port = await getPort()

  const gateway = await HyperGateway.create({
    port,
    persist: false,
    silent: true
  })

  try {
    const url = `http://localhost:${port}/hyper/blog.mauve.moe/`

    const response = await fetch(url)

    t.equal(response.status, 200, 'Loaded response correctly')

    t.ok(await response.text(), 'Non-empty response body')
  } finally {
    await gateway.close()
  }
})
