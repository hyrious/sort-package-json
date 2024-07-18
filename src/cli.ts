/// <reference types="node" />
import fs from 'node:fs'
import sade from 'sade'
import { name, version, description } from '../package.json'
import { sortJSON } from './index.js'

sade(`${name}`, true)
  .version(version)
  .describe(description)
  .option('-c, --check', 'Check if files are sorted', false)
  .option('-q, --quite', 'Do not output success messages', false)
  .action(function main({ _: files, check, quite }: { _: string[], check: boolean, quite: boolean }) {
    if (!files.length) files = ['package.json']
    for (const file of files) try {
      const raw = fs.readFileSync(file, 'utf8')
      const sorted = sortJSON(raw)
      if (raw != sorted) {
        if (check) {
          process.exitCode = 1
          if (!quite) console.warn(file)
        }
        else {
          fs.writeFileSync(file, sorted)
          if (!quite) console.log(' ✅', file)
        }
      }
    } catch {}
    if (!check && !quite) console.log('Done.')
  })
  .parse(process.argv)
