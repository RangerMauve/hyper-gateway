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
    const url = `http://localhost:${port}/hyper/blog.mauve.moe/`

    const response = await fetch(url)

    await checkOk(response, 'Loaded data from network', t)

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
    t.equal(response.headers.get('Location'), '://example2-mauve-moe.example.com/', 'Got expected subdomain in redirect')
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
        Host: 'blog-mauve-moe.example.com'
      }
    })

    await checkOk(response, 'Able to load', t)

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

    await checkOk(createResponse, 'Created drive', t)

    const hyperURL = await createResponse.text()
    const rootURL = hyperURL.replace('hyper://', domain + '/')

    const url = `${rootURL}/example.txt`

    const response = await fetch(url, {
      method: 'PUT',
      body: 'Hello World!'
    })

    await checkOk(response, 'Loaded response correctly', t)

    t.ok(response.headers.get('Location'), 'Location header got set in response')

    const response2 = await fetch(url)

    await checkOk(response2, 'Able to load uploaded file', t)

    t.equal(await response2.text(), 'Hello World!')
  } finally {
    await gateway.close()
  }
})

test.only('Get version from root', async (t) => {
  const port = await getPort()

  const gateway = await HyperGateway.create({
    port,
    storage: false,
    silent: true,
    writable: true
  })

  try {
    const domain = `http://localhost:${port}/`
    const infoResponse = await fetch(domain)

    await checkOk(infoResponse, 'Got info about server', t)

    const info = await infoResponse.json()

    t.ok(info?.version, 'Has version')
    t.ok(info?.dependencies, 'Has dependencies')
  } finally {
    await gateway.close()
  }
})

async function checkOk (response, message, t) {
  if (!response.ok) {
    t.error(
      new Error(message + ' ' + await response.text()),
      message
    )
  } else t.pass(message)
}
