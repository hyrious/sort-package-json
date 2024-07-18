import { build } from 'esbuild'
import { chmodSync, readFileSync, writeFileSync } from 'fs'

await build({
  entryPoints: ['src/index.ts', 'src/cli.ts'],
  bundle: true,
  platform: 'node',
  external: ['./index.js'],
  mainFields: ['module', 'main'],
  packages: 'bundle',
  format: 'esm',
  outdir: 'dist',
  logLevel: 'info',
}).catch(() => process.exit(1))

const shebang = '#!/usr/bin/env node'
let cli = readFileSync('dist/cli.js', 'utf8')
cli = cli[0] == '/' ? shebang + cli.slice(cli.indexOf('\n')) : shebang + '\n' + cli
writeFileSync('dist/cli.js', cli)

chmodSync('dist/cli.js', 0o755)
