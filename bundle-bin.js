#!/usr/bin/env node
import * as esbuild from 'esbuild'
import fs from 'node:fs'
import url from 'node:url'

import './generate-version.js'

const nativePlugin = {
  name: 'native-import',
  setup (build) {
    // Intercept import paths called "env" so esbuild doesn't attempt
    // to map them to a file system location. Tag them with the "env-ns"
    // namespace to reserve them for this plugin.
    build.onResolve({ filter: /-native|-universal/ }, args => ({
      path: args.path,
      external: true
    }))
  }
}

const importMetaPlugin = {
  name: 'import.meta.url',
  setup ({ onLoad }) {
    // TODO: change /()/ to smaller range
    onLoad({ filter: /()/, namespace: 'file' }, args => {
      let code = fs.readFileSync(args.path, 'utf8')
      code = code.replace(
        /\bimport\.meta\.url\b/g,
        JSON.stringify(url.pathToFileURL(args.path))
      )
      return { contents: code }
    })
  }
}

await esbuild.build({
  entryPoints: ['./src/bin.js'],
  bundle: true,
  outfile: 'dist/bundle.js',
  platform: 'node',
  plugins: [
    nativePlugin,
    importMetaPlugin
  ]
})
