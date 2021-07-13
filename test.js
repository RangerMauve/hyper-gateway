const test = require('tape')
const fetch = require('node-fetch')
const getPort = require('get-port')
const HyperGateway = require('./')

test('Load data', async (t) => {
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

test('Upload data', async (t) => {
  const port = await getPort()

  const gateway = await HyperGateway.create({
    port,
    persist: false,
    silent: true,
    writable: true
  })

  try {
    const url = `http://localhost:${port}/hyper/example/example.txt`

    const response = await fetch(url, {
      method: 'PUT',
      body: 'Hello World!'
    })

    t.equal(response.status, 200, 'Loaded response correctly')

    await response.text()

    const response2 = await fetch(url)

    t.ok(response2.ok, 'Able to load uploaded file')
    t.equal(await response2.text(), 'Hello World!')
  } finally {
    await gateway.close()
  }
})
