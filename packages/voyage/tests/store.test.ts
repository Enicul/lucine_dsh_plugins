import assert from 'node:assert/strict'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import {
  cleanFile, dayOf, readStore, requireDate, sortRequest, StoreError, withDay, withDone, withGroups, withThought, writeStore,
} from '../src/store.ts'

const EMPTY = { days: {}, thoughts: [] }
const thought = (id: string, text: string) => ({ id, text, created: '2026-11-12T09:00:00+08:00' })

async function folder(): Promise<{ dir: string; [Symbol.asyncDispose]: () => Promise<void> }> {
  const dir = await mkdtemp(join(tmpdir(), 'voyage-'))
  return { dir, [Symbol.asyncDispose]: () => rm(dir, { recursive: true, force: true }) }
}

test('a day always has three steps', () => {
  assert.deepEqual(dayOf(EMPTY, '2026-11-12').steps, [{ text: '', done: false }, { text: '', done: false }, { text: '', done: false }])
  const file = withDay(EMPTY, '2026-11-12', [{ text: 'read', done: true }, 'bad', { text: 'walk' }, { text: 'extra' }])
  assert.deepEqual(dayOf(file, '2026-11-12').steps, [{ text: 'read', done: true }, { text: '', done: false }, { text: 'walk', done: false }])
})

test('requireDate accepts only YYYY-MM-DD', () => {
  assert.equal(requireDate('2026-11-12'), '2026-11-12')
  for (const value of ['', '12/11/2026', 20261112, undefined]) assert.throws(() => requireDate(value), StoreError)
})

test('thoughts are trimmed, refused when empty or over the limit, and can be marked done', () => {
  let file = withThought(EMPTY, thought('a', '  call the landlord  '), 2)
  assert.equal(file.thoughts[0]?.text, 'call the landlord')
  assert.throws(() => withThought(file, thought('b', '   '), 2), { status: 400 })
  file = withThought(file, thought('b', 'second'), 2)
  assert.throws(() => withThought(file, thought('c', 'third'), 2), { status: 409 })
  assert.equal(withDone(file, 'b', true).thoughts[1]?.done, true)
  assert.throws(() => withDone(file, 'zzz', true), { status: 404 })
})

test('a sort numbers the thoughts and applies only known groups', () => {
  const groups = ['Decide', 'Project']
  let file = withThought(EMPTY, thought('a', 'pick a name'), 9)
  file = withThought(file, thought('b', 'fix the\nreader'), 9)
  file = withThought(file, thought('c', 'water plants'), 9)
  assert.match(sortRequest(file.thoughts, groups), /1\. pick a name\n2\. fix the reader\n3\. water plants/)
  const sorted = withGroups(file, file.thoughts, 'Here: {"1": "Decide", "2": "Project", "3": "Garden", "9": "Decide"}', groups)
  assert.deepEqual(sorted.thoughts.map(item => item.group), ['Decide', 'Project', ''])
  assert.throws(() => withGroups(file, file.thoughts, 'no json here', groups), { status: 502 })
  assert.throws(() => withGroups(file, file.thoughts, '{"1": "Garden"}', groups), { status: 502 })
})

test('the data file round-trips, starts empty, and a damaged file is refused', async () => {
  await using store = await folder()
  assert.deepEqual(await readStore(store.dir), EMPTY)
  const file = withThought(withDay(EMPTY, '2026-11-12', [{ text: 'read', done: false }]), thought('a', 'idea'), 9)
  await writeStore(store.dir, file)
  assert.deepEqual(await readStore(store.dir), file)
  assert.equal((await readFile(join(store.dir, 'voyage.json'), 'utf8')).endsWith('}\n'), true)
  await writeFile(join(store.dir, 'voyage.json'), '{broken')
  await assert.rejects(readStore(store.dir), { status: 500 })
})

test('cleanFile drops malformed days and thoughts', () => {
  const file = cleanFile({ days: { 'not-a-date': [], '2026-11-12': 'x' }, thoughts: [{ id: '', text: 'x' }, { id: 'a', text: ' ' }, { id: 'b', text: 'keep', done: 'yes' }, 7] })
  assert.deepEqual(Object.keys(file.days), ['2026-11-12'])
  assert.deepEqual(file.thoughts, [{ id: 'b', text: 'keep', created: '', group: '', done: false }])
})
