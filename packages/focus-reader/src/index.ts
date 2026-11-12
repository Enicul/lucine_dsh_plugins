/**
 * Host half of focus-reader: authenticated routes on the composition's
 * `webServer` that list the documents of one library folder, return a
 * document's blocks with its saved notes, replace those notes, and answer an AI
 * session message with the composition's default model.
 *
 * Every route asks the `connection` service for a rejection first. The model
 * call runs outside any Session: its prompt and reply are stored only in the
 * document's notes file.
 */

import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Context } from '@deepseek-ai/cordis'
import Schema from '@deepseek-ai/schemastery'
import type {} from '@deepseek-ai/dsh-host-webserver'
import type {} from '@deepseek-ai/dsh-agent-default-model'
import { BlockAssembler } from '@deepseek-ai/dsh-llm'
import {
  cleanNotes, contextAround, expandDir, LibraryError, listDocs, readDoc, readNotes, writeNotes,
} from './library.ts'
import {
  READER_ASK_PATH, READER_DOC_PATH, READER_DOCS_PATH, READER_NOTES_PATH,
  type ReaderAskPayload, type ReaderDocPayload, type ReaderDocsPayload, type ReaderMessage,
} from './shared.ts'

export type * from './shared.ts'

/** Cordis function-plugin name. */
export const name = 'focus-reader'
/** Route carrier, trust fence, model runtime, and the default model selection. */
export const inject = ['webServer', 'connection', 'llm', 'agentDefaultModel']

/** Focus-reader host configuration. */
export interface Config {
  /** Folder whose .md, .markdown and .txt files can be read; a leading `~` is the home directory. */
  libraryDir: string
  /** Largest document the reader opens, in bytes. */
  maxDocBytes: number
  /** Most documents one listing returns. */
  maxDocs: number
  /** Numbered blocks on each side of the passage that are given to the model. */
  contextBlocks: number
  /** Longest reply the model may write, in tokens. */
  maxReplyTokens: number
  /** Longest one reply may take before it is cancelled, in milliseconds. */
  askTimeoutMs: number
  /** Instructions given to the model before the passage. */
  systemPrompt: string
}

/** Validated configuration with defaults. */
export const Config: Schema<Config> = Schema.object({
  libraryDir: Schema.string().required(),
  maxDocBytes: Schema.number().default(2 * 1024 * 1024),
  maxDocs: Schema.number().default(500),
  contextBlocks: Schema.number().default(2),
  maxReplyTokens: Schema.number().default(1200),
  askTimeoutMs: Schema.number().default(120_000),
  systemPrompt: Schema.string().default(
    'You are a reading partner for a researcher. They selected a passage in a document and are discussing it with you. '
    + 'Answer about that passage and the surrounding text you are given. Be direct and brief: a few sentences unless asked for more. '
    + 'Say plainly when the given text does not support a claim or does not contain the answer. Reply in the language of the question.',
  ),
})

/** Request bodies are one JSON object: notes for a document, or one session's messages. */
const MAX_BODY_BYTES = 2 * 1024 * 1024

/** Trust surface consumed here; the connection package owns the full type. */
interface TrustConnection {
  requestRejection(request: { readonly headers: IncomingMessage['headers'] }): 401 | 403 | undefined
}

async function readJsonBody(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = []
  let size = 0
  for await (const chunk of req) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk))
    size += buffer.length
    if (size > MAX_BODY_BYTES) throw new LibraryError(413, 'request body too large')
    chunks.push(buffer)
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'))
  } catch (error: unknown) {
    void error
    throw new LibraryError(400, 'request body is not JSON')
  }
}

function sendJson(res: ServerResponse, status: number, payload: unknown): void {
  res.statusCode = status
  res.setHeader('content-type', 'application/json; charset=utf-8')
  res.setHeader('cache-control', 'no-store')
  res.end(JSON.stringify(payload))
}

type Handler = (req: IncomingMessage, url: URL) => Promise<unknown>

/**
 * Register the reader routes.
 * @param ctx - host services: web server, connection trust fence, model runtime, default model.
 * @param config - validated configuration.
 */
export function apply(ctx: Context, config: Config): void {
  const libraryDir = expandDir(config.libraryDir)
  const connection = Reflect.get(ctx, 'connection') as TrustConnection

  const route = (path: string, methods: Record<string, Handler>): void => {
    ctx.effect(() => ctx.webServer.register({
      kind: 'exact',
      path,
      handler: async (req, res) => {
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
        try {
          sendJson(res, 200, await handler(req, new URL(req.url ?? '', 'http://local')))
        } catch (error: unknown) {
          const status = error instanceof LibraryError ? error.status : 500
          sendJson(res, status, { error: error instanceof Error ? error.message : String(error) })
        }
      },
    }), `focus-reader: ${path}`)
  }

  const nameOf = (url: URL): string => url.searchParams.get('name') ?? ''

  route(READER_DOCS_PATH, {
    GET: async (): Promise<ReaderDocsPayload> => ({ libraryDir, docs: await listDocs(libraryDir, config.maxDocs) }),
  })

  route(READER_DOC_PATH, {
    GET: async (_req, url): Promise<ReaderDocPayload> => {
      const doc = nameOf(url)
      return { name: doc, blocks: await readDoc(libraryDir, doc, config.maxDocBytes), notes: await readNotes(libraryDir, doc) }
    },
  })

  route(READER_NOTES_PATH, {
    PUT: async (req, url) => {
      const doc = nameOf(url)
      // The document must exist: notes are never saved for a name that reads nothing.
      await readDoc(libraryDir, doc, config.maxDocBytes)
      await writeNotes(libraryDir, doc, cleanNotes(await readJsonBody(req)))
      return { saved: true }
    },
  })

  route(READER_ASK_PATH, {
    POST: async (req): Promise<ReaderAskPayload> => {
      const body = await readJsonBody(req)
      const fields = typeof body === 'object' && body !== null ? body as Record<string, unknown> : {}
      const doc = typeof fields.name === 'string' ? fields.name : ''
      const passage = typeof fields.passage === 'string' ? fields.passage : ''
      const p = Number.isInteger(fields.p) ? fields.p as number : -1
      const msgs = cleanNotes({ sessions: [{ id: 'x', p: 0, start: 0, end: 1, text: '', n: 1, msgs: fields.msgs }] }).sessions[0]?.msgs ?? []
      const question = msgs.at(-1)
      if (passage === '' || p < 0 || question?.role !== 'me' || question.text.trim() === '') {
        throw new LibraryError(400, 'name, p, passage and a final message from the reader are required')
      }
      const blocks = await readDoc(libraryDir, doc, config.maxDocBytes)
      const earlier = msgs.slice(0, -1)
      const text = [
        `Document: ${doc}`,
        `Surrounding text (numbers are paragraph numbers):\n${contextAround(blocks, p, config.contextBlocks)}`,
        `Selected passage, in paragraph ${p + 1}:\n"${passage}"`,
        earlier.length === 0 ? '' : `Conversation so far:\n${earlier.map((m: ReaderMessage) => `${m.role === 'me' ? 'Reader' : 'You'}: ${m.text}`).join('\n\n')}`,
        `Reader: ${question.text}`,
      ].filter(part => part !== '').join('\n\n')

      const { provider, model } = ctx.agentDefaultModel.currentSelection()
      const signal = AbortSignal.timeout(config.askTimeoutMs)
      const assembler = new BlockAssembler()
      const stream = ctx.llm.stream({
        provider,
        model,
        system: config.systemPrompt,
        messages: [{ role: 'user', content: [{ type: 'text', text }] }],
        maxTokens: config.maxReplyTokens,
        signal,
      })
      for await (const chunk of stream) {
        assembler.push(chunk)
        if (chunk.type === 'finish' && (chunk.reason.kind === 'error' || chunk.reason.kind === 'aborted')) {
          throw new Error(`the model did not answer (${chunk.reason.failure.code}): ${chunk.reason.failure.message}`)
        }
      }
      const reply = assembler.blocks().map(block => (block.type === 'text' ? block.text : '')).join('').trim()
      if (reply === '') throw new Error('the model returned no text')
      return { text: reply, model: `${provider}/${model}` }
    },
  })
}
