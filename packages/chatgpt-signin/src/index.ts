/**
 * Host half of chatgpt-signin: authenticated routes on the composition's
 * `webServer` that start, watch, stop and undo one account sign-in.
 *
 * The plugin owns no sign-in protocol. It starts the flow another plugin
 * registered with `ctx.authorization` (by default the ChatGPT flow of
 * `llm-pi-ai`), relays that flow's notices to the card, and answers its
 * questions. The flow stores the resulting grant in the credential store; no
 * route here reads or returns it. After a successful sign-in the provider's
 * route is added to the `providers` settings of the model adapter, which is
 * what puts its models in the model picker.
 *
 * Every route asks the `connection` service for a rejection first.
 */

import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Context } from '@deepseek-ai/cordis'
import Schema from '@deepseek-ai/schemastery'
import type {} from '@deepseek-ai/dsh-host-webserver'
import type {} from '@deepseek-ai/dsh-authorization'
import type {} from '@deepseek-ai/dsh-settings'
import type { CredentialKey } from '@deepseek-ai/dsh-credentials'
import { Attempt } from './attempt.ts'
import {
  SIGNIN_CANCEL_PATH, SIGNIN_PASTE_PATH, SIGNIN_PICKER_PATH, SIGNIN_SIGNOUT_PATH, SIGNIN_START_PATH, SIGNIN_STATE_PATH,
  type SignInEnding, type SignInState, type SignInWay,
} from './shared.ts'

export type * from './shared.ts'

/** Cordis function-plugin name. */
export const name = 'chatgpt-signin'
/** Route carrier, trust fence, the sign-in flows, the grant store, and the settings the model picker reads. */
export const inject = ['webServer', 'connection', 'authorization', 'credentials', 'settings']

/** chatgpt-signin host configuration. */
export interface Config {
  /** Provider id of the sign-in flow to run, as the model adapter names it. */
  provider: string
  /** Registered name of the plugin that owns the flow and its stored grant. */
  recordScope: string
  /** Profile entry id whose `providers` settings list the routes of the model picker. */
  settingsEntry: string
  /** Add the provider to the model picker after a sign-in, and remove it on sign-out. */
  addToPicker: boolean
  /** Name of the provider's group in the model picker; empty keeps the provider id. */
  pickerName: string
  /** Longest one attempt may run before it is stopped, in milliseconds. */
  attemptTimeoutMs: number
}

/** Validated configuration with defaults. */
export const Config: Schema<Config> = Schema.object({
  provider: Schema.string().default('openai-codex'),
  recordScope: Schema.string().default('llm-pi-ai'),
  settingsEntry: Schema.string().default('llm-pi-ai'),
  addToPicker: Schema.boolean().default(true),
  pickerName: Schema.string().default('ChatGPT'),
  attemptTimeoutMs: Schema.number().default(15 * 60_000),
})

/** The flow method this plugin runs; an account sign-in, never a typed API key. */
const METHOD = 'oauth'
/** Grammar of one segment of a credential record address, as the credential store defines it. */
const KEY_SEGMENT = /^[a-z][a-z0-9-]*$/
/** Request bodies are one small JSON object. */
const MAX_BODY_BYTES = 16 * 1024
/** Longest pasted address or code accepted. */
const MAX_PASTE_CHARS = 4096

/** A refused request with its HTTP status. */
class SignInError extends Error {
  constructor(readonly status: 400 | 409 | 413, message: string) {
    super(message)
    this.name = 'SignInError'
  }
}

/** Trust surface consumed here; the connection package owns the full type. */
interface TrustConnection {
  requestRejection(request: { readonly headers: IncomingMessage['headers'] }): 401 | 403 | undefined
}

type Handler = (req: IncomingMessage) => Promise<SignInState>

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

async function readJsonBody(req: IncomingMessage): Promise<Record<string, unknown>> {
  const chunks: Buffer[] = []
  let size = 0
  for await (const chunk of req) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk))
    size += buffer.length
    if (size > MAX_BODY_BYTES) throw new SignInError(413, 'request body too large')
    chunks.push(buffer)
  }
  let body: unknown
  try {
    body = JSON.parse(Buffer.concat(chunks).toString('utf8'))
  } catch (error: unknown) {
    void error
    throw new SignInError(400, 'request body is not JSON')
  }
  if (!isRecord(body)) throw new SignInError(400, 'request body is not a JSON object')
  return body
}

function sendJson(res: ServerResponse, status: number, payload: unknown): void {
  res.statusCode = status
  res.setHeader('content-type', 'application/json; charset=utf-8')
  res.setHeader('cache-control', 'no-store')
  res.end(JSON.stringify(payload))
}

/**
 * Register the sign-in routes.
 * @param ctx - host services named by {@link inject}.
 * @param config - which flow to run and what to do after it.
 */
export function apply(ctx: Context, config: Config): void {
  for (const segment of [config.recordScope, config.provider]) {
    if (!KEY_SEGMENT.test(segment)) {
      throw new Error(`chatgpt-signin: "${segment}" cannot address a stored sign-in; use lowercase letters, digits and hyphens`)
    }
  }
  const key = `${config.recordScope}/${config.provider}` as CredentialKey
  const connection = Reflect.get(ctx, 'connection') as TrustConnection
  const route = ['providers', config.provider]
  let attempt: Attempt | undefined
  let last: SignInEnding | undefined

  const inPicker = (): boolean => {
    const section = ctx.settings.describe().find(row => row.ns === config.settingsEntry)?.value
    const providers = isRecord(section) ? section['providers'] : undefined
    return isRecord(providers) && Object.hasOwn(providers, config.provider)
  }

  const addToPicker = async (): Promise<void> => {
    if (inPicker()) return
    // The profile the Models page writes for a provider added with nothing changed, plus the group name.
    const profile = config.pickerName === '' ? {} : { displayName: config.pickerName }
    await ctx.settings.mutate(config.settingsEntry, [{ op: 'set', path: route, value: profile }])
  }

  const state = async (): Promise<SignInState> => {
    const flow = ctx.authorization.describe(key)
    return {
      available: flow?.methods.some(method => method.id === METHOD) === true,
      label: flow?.label ?? config.provider,
      signedIn: (await ctx.credentials.describeRecord(key)).configured,
      inPicker: inPicker(),
      running: attempt !== undefined,
      ...attempt === undefined ? {} : { way: attempt.way },
      ...attempt?.step === undefined ? {} : { step: attempt.step },
      canPaste: attempt?.canPaste === true,
      ...last === undefined ? {} : { last },
    }
  }

  const start = (way: SignInWay): void => {
    if (attempt !== undefined) throw new SignInError(409, 'a sign-in is already running')
    const mine = new Attempt(way)
    attempt = mine
    last = undefined
    void ctx.authorization.begin({
      key,
      method: METHOD,
      signal: AbortSignal.timeout(config.attemptTimeoutMs),
      interaction: {
        notify: (notice) => { mine.notify(notice) },
        prompt: prompt => mine.prompt(prompt),
      },
    }).then(async (outcome): Promise<SignInEnding> => {
      if (outcome.status !== 'authorized') return { status: 'cancelled' }
      if (!config.addToPicker) return { status: 'authorized' }
      try {
        await addToPicker()
        return { status: 'authorized' }
      } catch (error: unknown) {
        // The sign-in is stored; only the picker step failed, and the card offers it again.
        return { status: 'authorized', message: messageOf(error) }
      }
    }, (error: unknown): SignInEnding => ({ status: 'failed', message: messageOf(error) })).then((ending) => {
      if (attempt === mine) attempt = undefined
      last = ending
    })
  }

  ctx.effect(() => () => {
    if (attempt !== undefined) ctx.authorization.cancel(key)
  }, 'chatgpt-signin: running attempt')

  const serve = (path: string, methods: Record<string, Handler>): void => {
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
          sendJson(res, 200, await handler(req))
        } catch (error: unknown) {
          sendJson(res, error instanceof SignInError ? error.status : 500, { error: messageOf(error) })
        }
      },
    }), `chatgpt-signin: ${path}`)
  }

  serve(SIGNIN_STATE_PATH, { GET: () => state() })

  serve(SIGNIN_START_PATH, {
    POST: async (req) => {
      const way = (await readJsonBody(req))['way']
      if (way !== 'browser' && way !== 'code') throw new SignInError(400, 'way must be "browser" or "code"')
      start(way)
      return state()
    },
  })

  serve(SIGNIN_PASTE_PATH, {
    POST: async (req) => {
      const text = (await readJsonBody(req))['text']
      if (typeof text !== 'string' || text.trim() === '' || text.length > MAX_PASTE_CHARS) {
        throw new SignInError(400, 'text must be the address the browser ended on, or the code it showed')
      }
      if (attempt?.paste(text.trim()) !== true) throw new SignInError(409, 'the sign-in is not waiting for an address')
      return state()
    },
  })

  serve(SIGNIN_CANCEL_PATH, {
    POST: () => {
      ctx.authorization.cancel(key)
      return state()
    },
  })

  serve(SIGNIN_PICKER_PATH, {
    POST: async () => {
      await addToPicker()
      if (last?.status === 'authorized') last = { status: 'authorized' }
      return state()
    },
  })

  serve(SIGNIN_SIGNOUT_PATH, {
    POST: async () => {
      if (attempt !== undefined) throw new SignInError(409, 'a sign-in is running; stop it first')
      await ctx.credentials.deleteRecord(key)
      last = undefined
      if (config.addToPicker && inPicker()) await ctx.settings.mutate(config.settingsEntry, [{ op: 'unset', path: route }])
      return state()
    },
  })
}
