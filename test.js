import test from 'tape'
import getPort from 'get-port'
import * as HyperGateway from './src/index.js'

test('Load data', async (t) => {
  const port = await getPort()

  const gateway = await HyperGateway.create({
    port,
    storage: false,
    silent: true
  })

  try {
    const url = `http://localhost:${port}/hyper/example2.mauve.moe/`

    const response = await fetch(url)

    t.ok(response.ok, 'Loaded response correctly')
    t.ok(await response.text(), 'Non-empty response body')
  } finally {
    await gateway.close()
  }
})

test('Subdomain redirect', async (t) => {
  const port = await getPort()

  const gateway = await HyperGateway.create({
    port,
    storage: false,
    silent: true,
    subdomainRedirect: true
  })

  try {
    const url = `http://localhost:${port}/hyper/example2.mauve.moe/`

    const response = await fetch(url, {
      redirect: 'manual',
      headers: {
        Host: 'example.com'
      }
    })

    t.equal(response.status, 301, 'Got redirect')
    t.equal(response.headers.get('Location'), '//example2-mauve-moe.example.com/', 'Got expected subdomain in redirect')
    t.notOk(await response.text(), 'Empty response body')
  } finally {
    await gateway.close()
  }
})

test('Subdomain serve', async (t) => {
  const port = await getPort()

  const gateway = await HyperGateway.create({
    port,
    storage: false,
    silent: true,
    subdomainRedirect: true
  })

  try {
    const url = `http://localhost:${port}/`

    const response = await fetch(url, {
      redirect: 'manual',
      headers: {
        Host: 'example2-mauve-moe.example.com'
      }
    })

    t.ok(response.ok, 'Able to load')
    t.ok(await response.text(), 'Non-Empty response body')
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
    const domain = `http://localhost:${port}/hyper`
    const createURL = `${domain}/localhost/?key=example`

    const createResponse = await fetch(createURL, {
      method: 'post'
    })

    if (!createResponse.ok) {
      const message = await createResponse.text()
      t.fail(`Unable to create: ${createResponse.status}: ${message}`)
    }

    const hyperURL = await createResponse.text()
    const rootURL = hyperURL.replace('hyper://', domain + '/')

    const url = `${rootURL}/example.txt`

    const response = await fetch(url, {
      method: 'PUT',
      body: 'Hello World!'
    })

    t.ok(response.ok, 'Loaded response correctly')

    if (!response.ok) {
      t.error(await response.text())
    }

    t.ok(response.headers.get('Location'), 'Location header got set in response')

    const response2 = await fetch(url)

    t.ok(response2.ok, 'Able to load uploaded file')

    if (!response2.ok) {
      t.error(await response2.text())
    }

    t.equal(await response2.text(), 'Hello World!')
  } finally {
    await gateway.close()
  }
})
