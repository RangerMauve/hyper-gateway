const fastifyHyperdrive = require('fastify-hyperdrive')
const makeFastify = require('fastify')
const SDK = require('hyper-sdk')

module.exports = {
  create
}

async function create ({
  port,
  serverOpts = {
    logger: true
  },
  hyperOpts = {},
  writable = false,
  persist = true,
  silent = false,
  p2pPort,
  storageLocation
} = {}) {
  const fastify = makeFastify({
    ...serverOpts,
    logger: !silent
  })

  fastify.log.info({
    port,
    p2pPort,
    writable,
    storageLocation,
    persist,
    silent
  }, 'Initializing server')

  const sdk = await SDK({
    applicationName: 'hyper-gateway',
    storage: storageLocation,
    persist,
    swarmOpts: {
      ephemeral: false,
      preferredPort: p2pPort
    },
    ...hyperOpts
  })

  const { Hyperdrive } = sdk

  const hyperdriveRoute = fastifyHyperdrive(Hyperdrive, { writable })

  fastify.all('/hyper/:key/*path', hyperdriveRoute)

  await fastify.listen(port)

  async function close () {
    fastify.log.info('Closing server')
    await Promise.all([
      fastify.close(),
      sdk.close()
    ])
    fastify.log.info('Closed')
  }

  return { sdk, fastify, close }
}
