// Replace this machine's absolute package path in built files with ".", so committed bundles carry no local folder names.
// Usage: node scripts/strip-local-paths.mjs <package dir>
import { readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

const dir = resolve(process.argv[2] ?? '.')
for (const file of ['lib/index.js', 'lib/client.js']) {
  const path = join(dir, file)
  const before = readFileSync(path, 'utf8')
  // The source map is not committed, so its reference is removed with the paths.
  const after = before.replaceAll(dir, '.').replace(/\n\/\/# sourceMappingURL=.*\n?$/, '\n')
  if (after !== before) writeFileSync(path, after)
}
