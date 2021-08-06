#!/usr/bin/env node

/* global process */

import * as pt from 'path'
import * as eb from 'esbuild'
import * as f from 'fpx'

const PROD = process.env.PROD === 'true'
const WATCH = process.argv.includes('--watch')
const MINIFY = PROD

// Reference: https://esbuild.github.io
eb.build({
  entryPoints: [`scripts/browser.mjs`],
  outfile: `public/scripts/browser.mjs`,
  bundle: true,
  watch: WATCH,
  format: 'esm',
  target: PROD ? 'es2019' : undefined,
  plugins: [{name: 'resolver', setup}],
  minify: MINIFY,
  sourcemap: MINIFY,
  legalComments: 'none',

  // Can be disabled to use native modules.
  // Requires an importmap, which works only in Chrome for now.
  write: true,
}).then(onBuildDone)

function onBuildDone({warnings}) {
  if (!WATCH && warnings && warnings.length) {
    console.error(`[scripts] build unsuccessful due to warnings`)
    process.exitCode = 1
  }
}

function setup(build) {
  build.onResolve({filter: /^jol$/}, nm(`@mitranim/jol/jol.mjs`))
}

function nm(...path) {
  return f.val({path: pt.resolve(pt.join('node_modules', ...path))})
}
