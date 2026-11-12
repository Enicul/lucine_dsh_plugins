import assert from 'node:assert/strict'
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import {
  cleanNotes, contextAround, LibraryError, listDocs, parseBlocks, readDoc, readNotes, resolveDoc, writeNotes,
} from '../src/library.ts'

async function library(): Promise<{ dir: string; [Symbol.asyncDispose]: () => Promise<void> }> {
  const dir = await mkdtemp(join(tmpdir(), 'focus-reader-'))
  return { dir, [Symbol.asyncDispose]: () => rm(dir, { recursive: true, force: true }) }
}

test('parseBlocks separates headings, paragraphs and fenced code', () => {
  const blocks = parseBlocks('# Title\n\nFirst line\nsecond line\n\n```py\nx = 1\n\ny = 2\n```\n## Next ##\nLast')
  assert.deepEqual(blocks, [
    { kind: 'heading', level: 1, text: 'Title' },
    { kind: 'para', text: 'First line\nsecond line' },
    { kind: 'code', text: 'x = 1\n\ny = 2' },
    { kind: 'heading', level: 2, text: 'Next' },
    { kind: 'para', text: 'Last' },
  ])
})

test('resolveDoc refuses names outside the library, dot folders and other file types', () => {
  for (const name of ['', '../x.md', 'a/../../x.md', '.focus-reader/x.md.json', '/etc/passwd', 'a//b.md', 'notes.pdf']) {
    assert.throws(() => resolveDoc('/lib', name), LibraryError, name)
  }
  assert.equal(resolveDoc('/lib', 'papers/a.md'), '/lib/papers/a.md')
})

test('listDocs walks subfolders and skips hidden folders and other file types', async () => {
  await using lib = await library()
  await mkdir(join(lib.dir, 'papers'))
  await mkdir(join(lib.dir, '.focus-reader'))
  await writeFile(join(lib.dir, 'a.md'), 'a')
  await writeFile(join(lib.dir, 'papers', 'b.txt'), 'b')
  await writeFile(join(lib.dir, 'c.pdf'), 'c')
  await writeFile(join(lib.dir, '.focus-reader', 'a.md.json'), '{}')
  assert.deepEqual((await listDocs(lib.dir, 10)).map(doc => doc.name).sort(), ['a.md', 'papers/b.txt'])
  assert.equal((await listDocs(lib.dir, 1)).length, 1)
  assert.deepEqual(await listDocs(join(lib.dir, 'missing'), 10), [])
})

test('readDoc reports a missing or oversized document', async () => {
  await using lib = await library()
  await writeFile(join(lib.dir, 'a.md'), 'hello world')
  await assert.rejects(readDoc(lib.dir, 'b.md', 100), { status: 404 })
  await assert.rejects(readDoc(lib.dir, 'a.md', 5), { status: 413 })
  assert.deepEqual(await readDoc(lib.dir, 'a.md', 100), [{ kind: 'para', text: 'hello world' }])
})

test('notes round-trip through the sidecar file and never touch the document', async () => {
  await using lib = await library()
  await mkdir(join(lib.dir, 'papers'))
  await writeFile(join(lib.dir, 'papers', 'a.md'), 'hello world')
  assert.deepEqual(await readNotes(lib.dir, 'papers/a.md'), { highlights: [], sessions: [] })
  const notes = cleanNotes({
    highlights: [{ id: 'h1', p: 0, start: 0, end: 5, text: 'hello' }, { id: '', p: 0, start: 0, end: 5, text: 'bad' }, { id: 'h2', p: 0, start: 4, end: 2, text: 'bad' }],
    sessions: [
      { id: 's1', p: 0, start: 6, end: 11, text: 'world', n: 1, msgs: [{ role: 'me', text: 'q' }, { role: 'system', text: 'x' }], links: ['s2', 's1', 'gone'], pinned: true },
      { id: 's2', p: 0, start: 0, end: 5, text: 'hello', n: 2, msgs: [], links: ['s1'] },
    ],
  })
  assert.equal(notes.highlights.length, 1)
  assert.deepEqual(notes.sessions[0]?.links, ['s2'])
  assert.deepEqual(notes.sessions[0]?.msgs, [{ role: 'me', text: 'q' }])
  assert.equal(notes.sessions[1]?.pinned, false)
  await writeNotes(lib.dir, 'papers/a.md', notes)
  assert.deepEqual(await readNotes(lib.dir, 'papers/a.md'), notes)
  assert.equal(await readFile(join(lib.dir, 'papers', 'a.md'), 'utf8'), 'hello world')
})

test('a corrupt notes file is reported instead of being treated as empty', async () => {
  await using lib = await library()
  await writeFile(join(lib.dir, 'a.md'), 'x')
  await mkdir(join(lib.dir, '.focus-reader'))
  await writeFile(join(lib.dir, '.focus-reader', 'a.md.json'), '{not json')
  await assert.rejects(readNotes(lib.dir, 'a.md'), SyntaxError)
})

test('contextAround returns the passage block, its neighbours and the heading above', () => {
  const blocks = parseBlocks('# A\n\none\n\n# B\n\ntwo\n\nthree\n\n# C\n\nfour\n\nfive')
  assert.equal(contextAround(blocks, 2, 1), '## B\n\n[2] two\n\n[3] three\n\n## C\n\n[4] four')
})
