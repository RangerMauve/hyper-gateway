#!/usr/bin/env node
import Yargs from 'yargs'
import { execSync } from 'node:child_process'

const yargs = Yargs(process.argv.slice(2))
const args = yargs
  .option('target')
  .demandOption('target')
  .option('install', {
    type: 'boolean',
    default: true
  })
  .parse(process.argv.slice(2))

const OUTPUT_MAP = {
  linux: './dist/hyper-gateway-linux',
  darwin: './dist/hyper-gateway-macos',
  win32: './dist/hyper-gateway-windows.exe'
}

const CONFIG_MAP = {
  linux: './linux.json',
  darwin: './darwin.json',
  win32: './win32.json'
}

const { target } = args
const targetKey = `pkg-${target}`

const configPath = CONFIG_MAP[target]

if (!configPath) throw new Error(`Invalid target, must supply ${targetKey} in the package.json`)

if (args.install) {
  console.log('Rebuilding dependencies for', target)

  execSync(`npm i --target_arch=x64 --target_platform=${target}`, { stdio: ['pipe', 'pipe', 'pipe'] })
} else {
  console.log('skipping rebuild')
}
const outputName = OUTPUT_MAP[target]

if (!outputName) throw new Error('Must specify appropriate output name in config')

console.log('Compiling, output to', outputName)

const pkgArgs = [
  './dist/bundle.js',
  `--config ${configPath}`,
  '--public',
  '--no-bytecode',
  `--output ${outputName}`,
  '--compress Brotli'
].join(' ')

console.log('Args: ', pkgArgs)

execSync(`pkg  ${pkgArgs}`, { stdio: ['pipe', 'pipe', 'pipe'] })

console.log('Done!')
