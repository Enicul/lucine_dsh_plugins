/**
 * The sign-in card on the bundle's page of the Plugins page. It shows one
 * state at a time: not signed in, signing in (one numbered step after the
 * other), or signed in. While an attempt runs the card asks the Host for the
 * state again every {@link POLL_MS} milliseconds.
 */

import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from 'react'
import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type {} from '@deepseek-ai/dsh-client-ui-plugin-manager/client'
import {
  SIGNIN_CANCEL_ROUTE, SIGNIN_PASTE_ROUTE, SIGNIN_PICKER_ROUTE, SIGNIN_SIGNOUT_ROUTE, SIGNIN_START_ROUTE, SIGNIN_STATE_ROUTE,
  type SignInState, type SignInWay,
} from '../shared.ts'
import css from './SignInCard.module.css'

type SignInCardProps = PropsRuntime<'plugins.bundle.config'> & PropsLocale<'chatgpt-signin'>

/** Wait between two state requests while an attempt runs. */
const POLL_MS = 1500

async function request(route: string, body?: Record<string, unknown>): Promise<SignInState> {
  const response = await fetch(route, {
    method: body === undefined ? 'GET' : 'POST',
    headers: { accept: 'application/json', ...body === undefined ? {} : { 'content-type': 'application/json' } },
    ...body === undefined ? {} : { body: JSON.stringify(body) },
  })
  const payload = await response.json() as SignInState & { error?: string }
  if (!response.ok) throw new Error(payload.error ?? `HTTP ${response.status}`)
  return payload
}

/**
 * Render the bundle's one-liner, or the sign-in card.
 * @param props - the view asked for and the card's copy.
 * @returns the one-liner, or the card.
 */
export function SignInCard({ t, view }: SignInCardProps): ReactNode {
  const [state, setState] = useState<SignInState>()
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [pasting, setPasting] = useState(false)
  const [pasted, setPasted] = useState('')
  const [copied, setCopied] = useState(false)

  const call = useCallback(async (route: string, body?: Record<string, unknown>): Promise<void> => {
    try {
      setState(await request(route, body))
      setError('')
    } catch (failure: unknown) {
      setError(failure instanceof Error ? failure.message : String(failure))
    }
  }, [])

  const act = useCallback(async (route: string, body: Record<string, unknown> = {}): Promise<void> => {
    setBusy(true)
    await call(route, body)
    setBusy(false)
  }, [call])

  const page = view === 'page'
  useEffect(() => {
    if (page) void call(SIGNIN_STATE_ROUTE)
  }, [page, call])

  const running = state?.running === true
  useEffect(() => {
    if (!page || !running) return
    const timer = setInterval(() => { void call(SIGNIN_STATE_ROUTE) }, POLL_MS)
    return () => { clearInterval(timer) }
  }, [page, running, call])

  // A finished or stopped attempt leaves no half-typed address or open confirmation behind.
  useEffect(() => {
    if (running) return
    setPasting(false)
    setPasted('')
    setCopied(false)
  }, [running])

  if (!page) return t('summary')

  const failure = error === '' ? null : <p className={css['bad']} role="alert">{t('failed').replace('{message}', () => error)}</p>
  if (state === undefined) return <div className={css['card']}>{failure ?? <p className={css['quiet']}>{t('loading')}</p>}</div>
  if (!state.available) return <div className={css['card']}><p className={css['quiet']}>{t('unavailable')}</p>{failure}</div>

  const start = (way: SignInWay): void => { void act(SIGNIN_START_ROUTE, { way }) }
  const sendPaste = (event: FormEvent): void => {
    event.preventDefault()
    if (pasted.trim() !== '') void act(SIGNIN_PASTE_ROUTE, { text: pasted })
  }
  const copyCode = (code: string): void => {
    // The code stays selectable when the clipboard is refused.
    void navigator.clipboard.writeText(code).then(() => { setCopied(true) }, () => { setCopied(false) })
  }

  if (state.running) {
    const step = state.step
    return (
      <div className={css['card']}>
        <h4 className={css['title']}><span className={css['dot']} data-tone="busy" />{t('run.title')}</h4>
        {step?.url === undefined ? <p className={css['quiet']}>{t('run.starting')}</p> : (
          <ol className={css['steps']}>
            <li>
              <span className={css['stepName']}>{t('run.step1')}</span>
              <a className={css['primary']} href={step.url} target="_blank" rel="noopener noreferrer">
                {t(state.way === 'code' ? 'run.openCode' : 'run.open')}
              </a>
            </li>
            <li>
              <span className={css['stepName']}>{t('run.step2')}</span>
              {step.code === undefined ? <span>{t('run.finish')}</span> : (
                <span className={css['codeRow']}>
                  {t('run.type')}
                  <code className={css['code']}>{step.code}</code>
                  <button type="button" className={css['plain']} onClick={() => { copyCode(step.code ?? '') }}>
                    {t(copied ? 'run.copied' : 'run.copy')}
                  </button>
                </span>
              )}
            </li>
          </ol>
        )}
        {state.canPaste ? (
          <div className={css['paste']}>
            <button type="button" className={css['link']} aria-expanded={pasting} onClick={() => { setPasting(open => !open) }}>
              {t('paste.toggle')}
            </button>
            {pasting ? (
              <form className={css['pasteForm']} onSubmit={sendPaste}>
                <p className={css['quiet']}>{t('paste.body')}</p>
                <div className={css['pasteRow']}>
                  <input className={css['input']} aria-label={t('paste.label')} value={pasted} autoComplete="off" spellCheck={false}
                    onChange={(event) => { setPasted(event.target.value) }} />
                  <button type="submit" className={css['plain']} disabled={busy || pasted.trim() === ''}>{t('paste.send')}</button>
                </div>
              </form>
            ) : null}
          </div>
        ) : null}
        <div className={css['row']}>
          <button type="button" className={css['plain']} disabled={busy} onClick={() => { void act(SIGNIN_CANCEL_ROUTE) }}>{t('run.stop')}</button>
        </div>
        {failure}
      </div>
    )
  }

  if (state.signedIn) {
    const why = state.last?.message
    return (
      <div className={css['card']}>
        <h4 className={css['title']}><span className={css['dot']} data-tone="good" />{t('in.title')}</h4>
        {state.inPicker ? <p>{t('in.body')}</p> : (
          <>
            <p>{t('in.noPicker')}</p>
            {why === undefined ? null : <p className={css['bad']}>{t('in.noPickerWhy').replace('{message}', () => why)}</p>}
            <div className={css['row']}>
              <button type="button" className={css['primary']} disabled={busy} onClick={() => { void act(SIGNIN_PICKER_ROUTE) }}>{t('in.add')}</button>
            </div>
          </>
        )}
        <div className={css['row']}>
          {confirming ? (
            <>
              <button type="button" className={css['danger']} disabled={busy}
                onClick={() => { setConfirming(false); void act(SIGNIN_SIGNOUT_ROUTE) }}>{t('in.signOutConfirm')}</button>
              <button type="button" className={css['plain']} onClick={() => { setConfirming(false) }}>{t('in.cancel')}</button>
            </>
          ) : <button type="button" className={css['plain']} disabled={busy} onClick={() => { setConfirming(true) }}>{t('in.signOut')}</button>}
        </div>
        {failure}
      </div>
    )
  }

  const last = state.last
  return (
    <div className={css['card']}>
      <h4 className={css['title']}><span className={css['dot']} />{t('out.title')}</h4>
      <p>{t('out.body')}</p>
      {last?.status === 'cancelled' ? <p className={css['quiet']}>{t('last.cancelled')}</p> : null}
      {last?.status === 'failed'
        ? <p className={css['bad']} role="alert">{t('last.failed').replace('{message}', () => last.message ?? '')}</p>
        : null}
      <div className={css['row']}>
        <button type="button" className={css['primary']} disabled={busy} onClick={() => { start('browser') }}>{t('out.browser')}</button>
        <button type="button" className={css['link']} disabled={busy} onClick={() => { start('code') }}>{t('out.code')}</button>
      </div>
      {failure}
    </div>
  )
}
