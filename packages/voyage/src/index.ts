/**
 * Host half of voyage: authenticated routes on the composition's `webServer`
 * that return and replace a day's three steps, add and close captured
 * thoughts, and ask the composition's default model to group the open ones.
 *
 * Every route asks the `connection` service for a rejection first. Changes to
 * the data file run one at a time. The model call runs outside any Session:
 * the thoughts it reads and the groups it returns are stored only in the data file.
 */

import { randomUUID } from 'node:crypto'
import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Context } from '@deepseek-ai/cordis'
import Schema from '@deepseek-ai/schemastery'
import type {} from '@deepseek-ai/dsh-host-webserver'
import type {} from '@deepseek-ai/dsh-agent-default-model'
import { BlockAssembler } from '@deepseek-ai/dsh-llm'
import {
  VOYAGE_DAY_PATH, VOYAGE_SORT_PATH, VOYAGE_STATE_PATH, VOYAGE_THOUGHT_PATH, type VoyageStatePayload,
} from './shared.ts'
import {
  dayOf, expandDir, readStore, requireDate, sortRequest, StoreError, withDay, withDone, withGroups, withThought, writeStore,
  type VoyageFile,
} from './store.ts'

export type * from './shared.ts'

/** Cordis function-plugin name. */
export const name = 'voyage'
/** Route carrier, trust fence, model runtime, and the default model selection. */
export const inject = ['webServer', 'connection', 'llm', 'agentDefaultModel']

/** Voyage host configuration. */
export interface Config {
  /** Folder holding `voyage.json`; a leading `~` is the home directory. */
  dataDir: string
  /** Group names a sort chooses from, in display order. */
  groups: string[]
  /** Most thoughts the data file may hold. */
  maxThoughts: number
  /** Most open thoughts one sort sends to the model. */
  maxSortThoughts: number
  /** Longest sort reply, in tokens. */
  maxSortTokens: number
  /** Longest one sort may take before it is cancelled, in milliseconds. */
  sortTimeoutMs: number
  /** Instructions given to the model before the thoughts. */
  sortPrompt: string
}

/** Validated configuration with defaults. */
export const Config: Schema<Config> = Schema.object({
  dataDir: Schema.string().required(),
  groups: Schema.array(Schema.string()).default(['Needs your decision', 'For the project', 'Life upkeep', 'Ideas to keep']),
  maxThoughts: Schema.number().default(2000),
  maxSortThoughts: Schema.number().default(200),
  maxSortTokens: Schema.number().default(2000),
  sortTimeoutMs: Schema.number().default(120_000),
  sortPrompt: Schema.string().default(
    'You sort short notes a person captured while concentrating on something else. '
    + 'Place every note in exactly one of the given groups, choosing by what the person would need to do with it.',
  ),
})

/** Request bodies are one small JSON object. */
const MAX_BODY_BYTES = 256 * 1024

/** Trust surface consumed here; the connection package owns the full type. */
interface TrustConnection {
  requestRejection(request: { readonly headers: IncomingMessage['headers'] }): 401 | 403 | undefined
}

async function readJsonBody(req: IncomingMessage): Promise<Record<string, unknown>> {
  const chunks: Buffer[] = []
  let size = 0
  for await (const chunk of req) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk))
    size += buffer.length
    if (size > MAX_BODY_BYTES) throw new StoreError(413, 'request body too large')
    chunks.push(buffer)
  }
  let body: unknown
  try {
    body = JSON.parse(Buffer.concat(chunks).toString('utf8'))
  } catch (error: unknown) {
    void error
    throw new StoreError(400, 'request body is not JSON')
  }
  return typeof body === 'object' && body !== null ? body as Record<string, unknown> : {}
}

type Handler = (req: IncomingMessage, url: URL) => Promise<VoyageStatePayload>

/**
 * Register the voyage routes.
 * @param ctx - host services: web server, connection trust fence, model runtime, default model.
 * @param config - validated configuration.
 */
export function apply(ctx: Context, config: Config): void {
  if (config.groups.length === 0) throw new Error('voyage: `groups` needs at least one group name')
  const dataDir = expandDir(config.dataDir)
  const connection = Reflect.get(ctx, 'connection') as TrustConnection

  // One change at a time: each reads the file, applies itself, and saves before the next starts.
  let queue: Promise<unknown> = Promise.resolve()
  const change = (date: string, edit: (file: VoyageFile) => VoyageFile | Promise<VoyageFile>): Promise<VoyageStatePayload> => {
    const run = queue.then(async () => {
      const file = await edit(await readStore(dataDir))
      await writeStore(dataDir, file)
      return payload(file, date)
    })
    queue = run.catch(() => undefined)
    return run
  }
  const payload = (file: VoyageFile, date: string): VoyageStatePayload => ({ day: dayOf(file, date), thoughts: file.thoughts, groups: config.groups })

  const route = (path: string, methods: Record<string, Handler>): void => {
    ctx.effect(() => ctx.webServer.register({
      kind: 'exact',
      path,
      handler: async (req, res: ServerResponse) => {
        const rejection = connection.requestRejection(req)
        if (rejection !== undefined) {
          res.statusCode = rejection
          res.end()
          return
        }
        const handler = methods[req.method ?? '']
        if (handler === undefined) {
          res.statusCode = 405
          res.setHeader('allow', Object.keys(methods).join(', '))
          res.end()
          return
        }
        let status = 200
        let body: unknown
        try {
          body = await handler(req, new URL(req.url ?? '', 'http://local'))
        } catch (error: unknown) {
          status = error instanceof StoreError ? error.status : 500
          body = { error: error instanceof Error ? error.message : String(error) }
        }
        res.statusCode = status
        res.setHeader('content-type', 'application/json; charset=utf-8')
        res.setHeader('cache-control', 'no-store')
        res.end(JSON.stringify(body))
      },
    }), `voyage: ${path}`)
  }

  route(VOYAGE_STATE_PATH, {
    GET: async (_req, url) => payload(await readStore(dataDir), requireDate(url.searchParams.get('date'))),
  })

  route(VOYAGE_DAY_PATH, {
    PUT: async (req) => {
      const body = await readJsonBody(req)
      const date = requireDate(body.date)
      return change(date, file => withDay(file, date, body.steps))
    },
  })

  route(VOYAGE_THOUGHT_PATH, {
    POST: async (req) => {
      const body = await readJsonBody(req)
      const date = requireDate(body.date)
      const text = typeof body.text === 'string' ? body.text : ''
      return change(date, file => withThought(file, { id: randomUUID(), text, created: new Date().toISOString() }, config.maxThoughts))
    },
    PUT: async (req) => {
      const body = await readJsonBody(req)
      const date = requireDate(body.date)
      if (typeof body.id !== 'string' || typeof body.done !== 'boolean') throw new StoreError(400, 'id and done are required')
      const { id, done } = body
      return change(date, file => withDone(file, id, done))
    },
  })

  route(VOYAGE_SORT_PATH, {
    POST: async (req) => {
      const date = requireDate((await readJsonBody(req)).date)
      const open = (await readStore(dataDir)).thoughts.filter(thought => !thought.done).slice(-config.maxSortThoughts)
      if (open.length === 0) throw new StoreError(400, 'there is nothing waiting to sort')
      const { provider, model } = ctx.agentDefaultModel.currentSelection()
      const assembler = new BlockAssembler()
      const stream = ctx.llm.stream({
        provider,
        model,
        system: config.sortPrompt,
        messages: [{ role: 'user', content: [{ type: 'text', text: sortRequest(open, config.groups) }] }],
        maxTokens: config.maxSortTokens,
        signal: AbortSignal.timeout(config.sortTimeoutMs),
      })
      for await (const chunk of stream) {
        assembler.push(chunk)
        if (chunk.type === 'finish' && (chunk.reason.kind === 'error' || chunk.reason.kind === 'aborted')) {
          throw new StoreError(502, `the model did not answer (${chunk.reason.failure.code}): ${chunk.reason.failure.message}`)
        }
      }
      const reply = assembler.blocks().map(block => (block.type === 'text' ? block.text : '')).join('')
      // Groups are applied by thought id, so thoughts captured or closed while the model was answering are kept as they are.
      return change(date, file => withGroups(file, open, reply, config.groups))
    },
  })
}
