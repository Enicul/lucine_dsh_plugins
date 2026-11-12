/** The capture box: one line, filed to Waiting, shown over whatever page is open. */
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { setCaptureOpen, useCaptureOpen } from './capture.ts'
import { captureThought } from './data.ts'
import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type {} from '@deepseek-ai/dsh-client-ui-layout/client'
import css from './Voyage.module.css'

/** How long the "filed" note stays, in milliseconds. */
const NOTE_MS = 2200

/**
 * Render the capture box and its confirmation note into the document body.
 * @param props - the overlay slot's runtime share and this plugin's translator.
 * @returns a portal, or nothing while the box is closed and no note is showing.
 */
export function CaptureBox({ t }: PropsRuntime<'shell.overlay'> & PropsLocale<'voyage'>) {
  const open = useCaptureOpen()
  const [text, setText] = useState('')
  const [note, setNote] = useState('')
  const input = useRef<HTMLInputElement>(null)
  // Focus returns to where the person was, so capturing does not lose their place.
  const before = useRef<Element | null>(null)

  useEffect(() => {
    if (!open) return
    before.current = document.activeElement
    input.current?.focus()
    return () => {
      if (before.current instanceof HTMLElement) before.current.focus()
    }
  }, [open])

  useEffect(() => {
    if (note === '') return
    const timer = window.setTimeout(() => { setNote('') }, NOTE_MS)
    return () => { window.clearTimeout(timer) }
  }, [note])

  const submit = (event: FormEvent): void => {
    event.preventDefault()
    const thought = text.trim()
    if (thought === '') {
      setCaptureOpen(false)
      return
    }
    void captureThought(thought).then((saved) => {
      // A thought that was not saved stays in the box so it is not lost.
      if (!saved) return
      setText('')
      setCaptureOpen(false)
      setNote(t('capture.filed'))
    })
  }

  if (!open && note === '') return null
  return createPortal(
    <>
      {open && (
        <div className={css.captureVeil} onMouseDown={(event) => { if (event.target === event.currentTarget) setCaptureOpen(false) }}>
          <form className={css.captureBox} onSubmit={submit} onKeyDown={(event) => { if (event.key === 'Escape') setCaptureOpen(false) }}>
            <label className={css.small} htmlFor="voyage-capture">{t('capture.title')}</label>
            <input id="voyage-capture" ref={input} className={css.captureInput} value={text} placeholder={t('capture.placeholder')} autoComplete="off" onChange={(event) => { setText(event.target.value) }} />
            <span className={css.small}>{t('capture.keys')}</span>
          </form>
        </div>
      )}
      {note !== '' && <div className={css.captureNote} role="status">{note}</div>}
    </>,
    document.body,
  )
}
