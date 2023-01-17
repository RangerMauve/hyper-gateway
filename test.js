import test from 'tape'
import getPort from 'get-port'
import * as HyperGateway from './src/index.js'

test.skip('Load data', async (t) => {
  const port = await getPort()

  const gateway = await HyperGateway.create({
    port,
    storage: false,
    silent: true
  })

  try {
    const url = `http://localhost:${port}/hyper/blog.mauve.moe/`

    const response = await fetch(url)

    t.ok(response.ok, 'Loaded response correctly')

    t.ok(await response.text(), 'Non-empty response body')
  } finally {
    await gateway.close()
  }
})

test('Upload data', async (t) => {
  const port = await getPort()

  const gateway = await HyperGateway.create({
    port,
    storage: false,
    silent: true,
    writable: true
  })

  try {
    const url = `http://localhost:${port}/hyper/example/example.txt`

    const response = await fetch(url, {
      method: 'PUT',
      body: 'Hello World!'
    })

    t.ok(response.ok, 'Loaded response correctly')

    if(!response.ok) {
      t.error(await response.text())
    }

    t.ok(response.headers.get('Location'), 'Location header got set in response')

    const response2 = await fetch(url)

    t.ok(response2.ok, 'Able to load uploaded file')

    if(!response2.ok) {
      t.error(await response2.text())
    }

    t.equal(await response2.text(), 'Hello World!')
  } finally {
    await gateway.close()
  }
})
