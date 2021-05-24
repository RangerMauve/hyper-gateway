#!/usr/bin/env node
const yargs = require('yargs')
const envPaths = require('env-paths')

function runOptions (yargs) {
  return yargs
    .option('writable', {
      describe: 'Control access to `PUT`',
      type: 'boolean',
      default: false
    })
    .option('port', {
      describe: 'The port to run the server on (HYPE)',
      default: 4973
    })
    .option('p2p-port', {
      describe: 'The port to run the p2p network on (HYPR)',
      default: 4977
    })
    .option('persist', {
      describe: 'Whether data should be persisted to disk',
      type: 'boolean',
      default: true
    })
    .option('storage-location', {
      describe: 'The location to store hypercore data',
      default: envPaths('hyper-gateway').data
    })
    .option('silent', {
      describe: 'Prevent additional logs',
      type: 'boolean',
      default: false
    })
}

async function runServer (args) {
  const { create } = require('./')

  const { close } = await create(args)

  process.on('SIGINT', async () => {
    try {
      await close()
    } catch (e) {
      console.error('Unable to close gracefully')
      console.error(e)
      process.exit(1)
    }
  })
}

yargs
  .scriptName('hyper-gateway')
  .showHelpOnFail(true)
  .demandCommand()
  .command('run', 'Run the gateway', runOptions, runServer)
  .help()
  .parse(process.argv.slice(2))
