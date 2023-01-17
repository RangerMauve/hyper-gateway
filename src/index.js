import http from 'http'
import * as SDK from 'hyper-sdk'
import makeHypercoreFetch from 'hypercore-fetch'
import { Readable } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import makeDebug from 'debug'

const log = (...args) => console.log(...args)

const DEFAULT_STORAGE = 'hyper-gateway'

const EPHEMERAL_METHODS = [
  'get',
  'head',
  'options'
]

export async function create ({
  port,
  serverOpts = {
    logger: true
  },
  hyperOpts = {},
  writable = false,
  silent = false,
  storage = DEFAULT_STORAGE
} = {}) {
  const debug = silent ? makeDebug('hyper-gateway') : log

  debug('Initializing server %O', {
    port,
    writable
  })

  const sdk = await SDK.create({
    storage,
    ...hyperOpts
  })

  const fetch = await makeHypercoreFetch({ sdk, writable })

  const server = http.createServer(async (req, res) => {
    try {
      const { method, url, headers } = req
      debug('Request: %O', { method, url, headers })

      // TODO: Show something at the root?
      if (!url.startsWith('/hyper/')) {
        res.writeHead(404)
        res.end('Not Found')
        return
      }

      const finalURL = 'hyper://' + url.slice('/hyper/'.length)

      const isEphemeral = EPHEMERAL_METHODS.includes(method.toLowerCase())

      const body = isEphemeral ? null : Readable.from(req)

      const response = await fetch(finalURL, {
        method,
        headers,
        body,
        // Required to do requests with ReadableStream bodies
        // Breaks in Node 18.13+
        duplex: 'half'
      })

      const responseHeaders = {}
      for (const [name, value] of response.headers) {
        responseHeaders[name] = value
      }
      const { status } = response

      debug('Requested: %O', { method, url: finalURL, status, responseHeaders })

      res.writeHead(response.status, responseHeaders)

      await pipeline(
        Readable.from(response.body || [], { objectMode: false }),
        res
      )
    } catch (e) {
      debug(e)
      res.writeHead(500, { 'Content-Type': 'text/plain' })
      res.end(e.message)
    }
  })

  await new Promise((resolve, reject) => {
    server.listen(port, (err) => {
      if (err) reject(err)
      else resolve()
    })
  })

  async function close () {
    await Promise.all([
      server.close(),
      sdk.close()
    ])
    debug('closed')
  }

  return { sdk, server, close }
}
