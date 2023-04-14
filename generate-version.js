#!/usr/bin/env node

import { readFile, writeFile } from 'node:fs/promises'

const packageFile = new URL('./package.json', import.meta.url)
const versionFile = new URL('./src/version.js', import.meta.url)

const packageJSON = JSON.parse(await readFile(packageFile, 'utf8'))

const serverInfo = {
  name: packageJSON.name,
  version: packageJSON.version,
  repository: packageJSON.repository,
  dependencies: {
    'hypercore-fetch': packageJSON.dependencies['hypercore-fetch'],
    'hyper-sdk': packageJSON.dependencies['hyper-sdk']
  }
}

const serverInfoString = JSON.stringify(serverInfo, null, '  ')

const versionJS = `
export const SERVER_INFO = ${serverInfoString}
`

await writeFile(versionFile, versionJS)
