/**
 * One sign-in attempt as the card sees it: the step the flow last reported and
 * the single question it may be waiting on. The object answers the flow's
 * questions; it starts nothing and stores no token.
 */

import type { SignInStep, SignInWay } from './shared.ts'

/** Option ids the ChatGPT sign-in flow offers when it asks how to sign in. */
export const WAY_OPTIONS: Readonly<Record<SignInWay, string>> = { browser: 'browser', code: 'device_code' }

/** A notice from the running flow. */
export interface AttemptNotice {
  readonly message: string
  readonly url?: string
  readonly code?: string
}

/** A question from the running flow. */
export type AttemptPrompt = {
  /** Withdraws this question alone. */
  readonly signal?: AbortSignal
} & ({
  readonly kind: 'text' | 'secret'
  readonly message: string
} | {
  readonly kind: 'select'
  readonly message: string
  readonly options: readonly { readonly id: string }[]
})

/** The question a pasted answer resolves. */
interface Waiting {
  readonly resolve: (text: string) => void
}

/** Tracks one attempt's step and pending question. */
export class Attempt {
  private current: SignInStep | undefined
  private waiting: Waiting | undefined

  /** @param way - how the person chose to sign in. */
  constructor(readonly way: SignInWay) {}

  /** The step the flow last reported, if any. */
  get step(): SignInStep | undefined { return this.current }

  /** Whether the flow is waiting for a pasted address or code. */
  get canPaste(): boolean { return this.waiting !== undefined }

  /**
   * Keep the flow's latest notice as the current step. A later notice without
   * a page or code keeps the ones the person still needs. An address that is
   * not `https:` is dropped, so the card never links anywhere else.
   * @param notice - what the flow reported.
   */
  notify(notice: AttemptNotice): void {
    const url = notice.url !== undefined && /^https:\/\//i.test(notice.url) ? notice.url : this.current?.url
    const code = notice.code ?? this.current?.code
    this.current = {
      message: notice.message,
      ...url === undefined ? {} : { url },
      ...code === undefined ? {} : { code },
    }
  }

  /**
   * Answer one question from the flow. The choice of way is answered at once;
   * a text question waits for {@link paste}.
   * @param prompt - what the flow asked.
   * @returns the chosen option id, or the pasted text.
   * @throws when the flow offers no option for the chosen way, asks for a secret, asks a second text question while one waits, or withdraws the question.
   */
  prompt(prompt: AttemptPrompt): Promise<string> {
    if (prompt.kind === 'select') {
      const wanted = WAY_OPTIONS[this.way]
      if (prompt.options.some(option => option.id === wanted)) return Promise.resolve(wanted)
      return Promise.reject(new Error(
        `the sign-in offers no "${wanted}" option; it offers: ${prompt.options.map(option => option.id).join(', ')}`))
    }
    if (prompt.kind === 'secret') return Promise.reject(new Error('this sign-in asked for a secret, which this page never collects'))
    if (this.waiting !== undefined) return Promise.reject(new Error('the sign-in asked a second question before the first was answered'))
    if (prompt.signal?.aborted === true) return Promise.reject(new Error('the sign-in withdrew its question'))
    return new Promise<string>((resolve, reject) => {
      const waiting: Waiting = {
        resolve: (text) => {
          prompt.signal?.removeEventListener('abort', withdrawn)
          resolve(text)
        },
      }
      const withdrawn = (): void => {
        if (this.waiting === waiting) this.waiting = undefined
        reject(new Error('the sign-in withdrew its question'))
      }
      prompt.signal?.addEventListener('abort', withdrawn, { once: true })
      this.waiting = waiting
    })
  }

  /**
   * Hand the waiting question its answer.
   * @param text - the address the browser ended on, or the code it showed.
   * @returns false when no question is waiting.
   */
  paste(text: string): boolean {
    const waiting = this.waiting
    if (waiting === undefined) return false
    this.waiting = undefined
    waiting.resolve(text)
    return true
  }
}
