/**
 * Host half of focus-reader: authenticated routes on the composition's
 * `webServer` that list the documents of one library folder, return a
 * document's blocks with its saved notes, replace those notes, and answer an AI
 * session message with the composition's default model. One more route imports
 * an arXiv paper: it fetches the paper's web-page version and its pictures from
 * arxiv.org and saves them in the library folder, the text as Markdown. A last
 * route returns one picture of the library.
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
import { arxivPaper, arxivToMarkdown, paperFileName } from './arxiv.ts'
import {
  cleanNotes, contextAround, expandDir, findDoc, LibraryError, listDocs, readDoc, readNotes, readPicture, resolveDoc, saveDoc,
  savePicture, writeNotes,
} from './library.ts'
import {
  READER_ADD_PATH, READER_ASK_PATH, READER_DOC_PATH, READER_DOCS_PATH, READER_NOTES_PATH, READER_PICTURE_PATH,
  type ReaderAddPayload, type ReaderAskPayload, type ReaderDocPayload, type ReaderDocsPayload, type ReaderMessage,
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
  /** Folder inside the library where imported papers are saved, with `/` separators. */
  importFolder: string
  /** Largest web page an import downloads, in bytes. */
  maxImportBytes: number
  /** Longest an import may wait for one file from arxiv.org, in milliseconds. */
  importTimeoutMs: number
  /** Most pictures one import downloads; further pictures are left as a line of text. */
  maxImportPictures: number
  /** Largest picture an import downloads or the reader shows, in bytes. */
  maxPictureBytes: number
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
  importFolder: Schema.string().default('papers'),
  maxImportBytes: Schema.number().default(16 * 1024 * 1024),
  importTimeoutMs: Schema.number().default(30_000),
  maxImportPictures: Schema.number().default(80),
  maxPictureBytes: Schema.number().default(8 * 1024 * 1024),
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

/**
 * Download one file from arxiv.org.
 * @param url - address on arxiv.org.
 * @param maxBytes - the download stops with a failure once the body is larger.
 * @param timeoutMs - longest wait for the whole download.
 * @returns the file's bytes and the address that answered after redirects.
 * @throws {LibraryError} 404 when arXiv has no such file, 413 when it is too large, 502 for any other failed download.
 */
async function fetchArxiv(url: string, maxBytes: number, timeoutMs: number): Promise<{ bytes: Buffer; url: string }> {
  let response: Response
  try {
    response = await fetch(url, { signal: AbortSignal.timeout(timeoutMs), headers: { 'user-agent': 'dsh-focus-reader' } })
  } catch (error: unknown) {
    throw new LibraryError(502, `arxiv.org could not be reached: ${error instanceof Error ? error.message : String(error)}`)
  }
  if (response.status === 404) throw new LibraryError(404, `arxiv.org has no file at ${url}`)
  if (!response.ok || !/(^|\.)arxiv\.org$/.test(new URL(response.url).hostname) || response.body === null) {
    throw new LibraryError(502, `arxiv.org answered ${response.status} for ${url}`)
  }
  const chunks: Uint8Array[] = []
  let size = 0
  try {
    for await (const chunk of response.body) {
      size += chunk.length
      if (size > maxBytes) throw new LibraryError(413, `${url} is larger than ${maxBytes} bytes`)
      chunks.push(chunk)
    }
  } catch (error: unknown) {
    if (error instanceof LibraryError) throw error
    throw new LibraryError(502, `the download from arxiv.org stopped: ${error instanceof Error ? error.message : String(error)}`)
  }
  return { bytes: Buffer.concat(chunks), url: response.url }
}

/** Downloads of one paper's pictures that run at the same time. */
const PICTURE_LANES = 4

type Handler = (req: IncomingMessage, url: URL) => Promise<unknown>

/**
 * Register the reader routes.
 * @param ctx - host services: web server, connection trust fence, model runtime, default model.
 * @param config - validated configuration.
 */
export function apply(ctx: Context, config: Config): void {
  const libraryDir = expandDir(config.libraryDir)
  // A folder name that leaves the library, or enters a dot folder, stops the plugin at load.
  resolveDoc(libraryDir, `${config.importFolder}/x.md`)
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

  route(READER_ADD_PATH, {
    POST: async (req): Promise<ReaderAddPayload> => {
      const body = await readJsonBody(req)
      const link = typeof body === 'object' && body !== null && 'url' in body && typeof body.url === 'string' ? body.url : ''
      const paper = arxivPaper(link)
      if (paper === undefined) {
        throw new LibraryError(400, 'this is not an arXiv paper link. Paste an address such as https://arxiv.org/abs/2610.11291')
      }
      const refresh = typeof body === 'object' && body !== null && 'refresh' in body && body.refresh === true
      const existing = await findDoc(libraryDir, config.importFolder, paper.id)
      if (existing !== undefined && !refresh) return { name: existing, existing: true, pictures: 0, missingPictures: 0 }
      let page: { bytes: Buffer; url: string }
      try {
        page = await fetchArxiv(paper.htmlUrl, config.maxImportBytes, config.importTimeoutMs)
      } catch (error: unknown) {
        if (error instanceof LibraryError && error.status === 404) {
          throw new LibraryError(404, 'arXiv has no web-page version of this paper. It only has the PDF, which the reader cannot convert.')
        }
        throw error
      }
      const converted = arxivToMarkdown(page.bytes.toString('utf8'), { sourceUrl: paper.absUrl, pageUrl: page.url, pictureFolder: paper.id })
      if (converted.title === '' || converted.paragraphs < 3) {
        throw new LibraryError(502, 'the page arxiv.org returned holds no paper text')
      }
      // A picture that cannot be downloaded leaves a line of text where it would be shown.
      const missing = new Set<string>(converted.pictures.slice(config.maxImportPictures).map(picture => picture.line))
      const queue = converted.pictures.slice(0, config.maxImportPictures)
      await Promise.all(Array.from({ length: PICTURE_LANES }, async () => {
        for (let picture = queue.shift(); picture !== undefined; picture = queue.shift()) {
          try {
            const file = await fetchArxiv(picture.url, config.maxPictureBytes, config.importTimeoutMs)
            await savePicture(libraryDir, `${config.importFolder}/${paper.id}/${picture.file}`, file.bytes)
          } catch (error: unknown) {
            if (!(error instanceof LibraryError)) throw error
            missing.add(picture.line)
          }
        }
      }))
      const blocks = converted.blocks.map(block => (missing.has(block) ? '[Picture not downloaded — see the original]' : block))
      const doc = existing ?? `${config.importFolder}/${paperFileName(paper.id, converted.title)}`
      await saveDoc(libraryDir, doc, `${blocks.join('\n\n')}\n`)
      return { name: doc, existing: false, pictures: converted.pictures.length - missing.size, missingPictures: missing.size }
    },
  })

  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: READER_PICTURE_PATH,
    handler: async (req, res) => {
      const rejection = connection.requestRejection(req)
      if (rejection !== undefined) {
        res.statusCode = rejection
        res.end()
        return
      }
      if (req.method !== 'GET') {
        res.statusCode = 405
        res.setHeader('allow', 'GET')
        res.end()
        return
      }
      try {
        const picture = await readPicture(libraryDir, nameOf(new URL(req.url ?? '', 'http://local')), config.maxPictureBytes)
        res.statusCode = 200
        res.setHeader('content-type', picture.type)
        res.setHeader('x-content-type-options', 'nosniff')
        // A downloaded SVG is shown as an image only; opened on its own it may run no script and load nothing.
        res.setHeader('content-security-policy', 'sandbox; default-src \'none\'; style-src \'unsafe-inline\'')
        res.setHeader('cache-control', 'private, max-age=3600')
        res.end(picture.bytes)
      } catch (error: unknown) {
        const status = error instanceof LibraryError ? error.status : 500
        sendJson(res, status, { error: error instanceof Error ? error.message : String(error) })
      }
    },
  }), `focus-reader: ${READER_PICTURE_PATH}`)

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
