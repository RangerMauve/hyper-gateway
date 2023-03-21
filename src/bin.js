#!/usr/bin/env node
import Yargs from 'yargs'
import envPaths from 'env-paths'
import { create } from './index.js'

const yargs = Yargs(process.argv.slice(2))

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
    .option('subdomain', {
      describe: 'Enable serving `example-com.gateway.com/path` as `gateway.com/hyper/example.com/path`',
      type: 'boolean',
      default: false
    })
    .option('subdomain-redirect', {
      describe: 'Redirect `gateway.com/hyper/domain.here/path` to `domain-here.gateway.com/path`',
      type: 'boolean',
      default: false
    })
}

async function runServer (args) {
  const { writable, port, persist, storageLocation, silent, subdomain, subdomainRedirect } = args

  const storage = persist ? storageLocation : false

  const { close } = await create({
    writable,
    port,
    silent,
    storage,
    subdomain,
    subdomainRedirect
  })

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
