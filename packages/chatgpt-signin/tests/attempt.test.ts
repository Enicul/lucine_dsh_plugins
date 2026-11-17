import assert from 'node:assert/strict'
import { test } from 'node:test'
import { Attempt } from '../src/attempt.ts'

const WAYS = { kind: 'select', message: 'how?', options: [{ id: 'browser' }, { id: 'device_code' }] } as const

test('the choice of way is answered with the option of the chosen way', async () => {
  assert.equal(await new Attempt('browser').prompt(WAYS), 'browser')
  assert.equal(await new Attempt('code').prompt(WAYS), 'device_code')
})

test('a flow that does not offer the chosen way is refused with the options it offers', async () => {
  await assert.rejects(
    new Attempt('code').prompt({ kind: 'select', message: 'how?', options: [{ id: 'browser' }] }),
    /no "device_code" option; it offers: browser/,
  )
})

test('a notice keeps the page and code of an earlier notice and drops an address that is not https', () => {
  const attempt = new Attempt('code')
  assert.equal(attempt.step, undefined)
  attempt.notify({ message: 'enter the code', url: 'https://auth.example/device', code: 'ABCD-1234' })
  attempt.notify({ message: 'waiting' })
  assert.deepEqual(attempt.step, { message: 'waiting', url: 'https://auth.example/device', code: 'ABCD-1234' })
  attempt.notify({ message: 'moved', url: 'javascript:alert(1)' })
  assert.deepEqual(attempt.step, { message: 'moved', url: 'https://auth.example/device', code: 'ABCD-1234' })
  const fresh = new Attempt('browser')
  fresh.notify({ message: 'open', url: 'http://plain.example/' })
  assert.deepEqual(fresh.step, { message: 'open' })
})

test('a text question waits for the pasted answer', async () => {
  const attempt = new Attempt('browser')
  assert.equal(attempt.paste('early'), false)
  const answer = attempt.prompt({ kind: 'text', message: 'paste the address' })
  assert.equal(attempt.canPaste, true)
  assert.equal(attempt.paste('http://localhost:1455/auth/callback?code=x'), true)
  assert.equal(await answer, 'http://localhost:1455/auth/callback?code=x')
  assert.equal(attempt.canPaste, false)
  assert.equal(attempt.paste('again'), false)
})

test('a withdrawn text question stops accepting a paste', async () => {
  const attempt = new Attempt('browser')
  const withdraw = new AbortController()
  const answer = attempt.prompt({ kind: 'text', message: 'paste the address', signal: withdraw.signal })
  withdraw.abort()
  await assert.rejects(answer, /withdrew its question/)
  assert.equal(attempt.canPaste, false)
  await assert.rejects(attempt.prompt({ kind: 'text', message: 'again', signal: withdraw.signal }), /withdrew its question/)
})

test('a secret is never collected and a second waiting question is refused', async () => {
  const attempt = new Attempt('browser')
  await assert.rejects(attempt.prompt({ kind: 'secret', message: 'key?' }), /never collects/)
  const first = attempt.prompt({ kind: 'text', message: 'one' })
  await assert.rejects(attempt.prompt({ kind: 'text', message: 'two' }), /second question/)
  attempt.paste('done')
  assert.equal(await first, 'done')
})
