/**
 * Reader page: one centred reading column whose brightness follows the scroll
 * position, highlights, and AI sessions that open beside the passage they are
 * anchored to. A session follows its passage, holds at the top once it gets
 * there, and folds into a one-line chip when the next open session arrives.
 * Opening a session closes every other one that is not pinned.
 */
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type {} from '@deepseek-ai/dsh-client-ui-layout/client'
import {
  READER_ASK_ROUTE, READER_DOC_ROUTE, READER_DOCS_ROUTE, READER_NOTES_ROUTE,
  type ReaderAnchor, type ReaderAskPayload, type ReaderAskRequest, type ReaderBlock, type ReaderDocPayload,
  type ReaderDocsPayload, type ReaderNotes, type ReaderSession,
} from '../shared.ts'
import { Markdown } from './Markdown.tsx'
import css from './ReaderPage.module.css'

type ReaderPageProps = PropsRuntime<'main'> & PropsLocale<'focus-reader'>
type Translate = ReaderPageProps['t']

/** Container width above which sessions sit in a lane beside the text. */
const WIDE = 980
/** Distance from the top of the page at which a session holds, below the document bar. */
const STICK_TOP = 58
/** Height reserved for each folded session above a held one. */
const CHIP_ROW = 44
const LANE_GAP = 12
const LAST_DOC_KEY = 'focus-reader:last-doc'
const EMPTY: ReaderNotes = { highlights: [], sessions: [] }

const short = (text: string, max = 60): string => (text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text)
const calm = (): boolean => matchMedia('(prefers-reduced-motion: reduce)').matches
const newId = (prefix: string): string => `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`

async function api<T>(route: string, init?: RequestInit): Promise<T> {
  const response = await fetch(route, { ...init, headers: { accept: 'application/json', ...init?.headers } })
  const body = await response.json() as T & { error?: string }
  if (!response.ok) throw new Error(body.error ?? `HTTP ${response.status}`)
  return body
}

function remembered(): string {
  try {
    return localStorage.getItem(LAST_DOC_KEY) ?? ''
  } catch (error: unknown) {
    // Storage can be blocked; the reader then starts with no document chosen.
    void error
    return ''
  }
}

function remember(name: string): void {
  try {
    localStorage.setItem(LAST_DOC_KEY, name)
  } catch (error: unknown) {
    // Remembering the last document is a convenience only.
    void error
  }
}

/** Find where an anchor's text now sits; the file may have been edited since the note was made. */
function locate<T extends ReaderAnchor>(anchor: T, paras: readonly string[]): T | undefined {
  if (paras[anchor.p]?.slice(anchor.start, anchor.end) === anchor.text) return anchor
  const order = [anchor.p, ...paras.keys()]
  for (const p of order) {
    const at = paras[p]?.indexOf(anchor.text) ?? -1
    if (at >= 0) return { ...anchor, p, start: at, end: at + anchor.text.length }
  }
  return undefined
}

interface BoxProps {
  readonly session: ReaderSession
  readonly sessions: readonly ReaderSession[]
  readonly busy: boolean
  readonly anyBusy: boolean
  readonly error: string
  readonly picking: boolean
  readonly t: Translate
  readonly onAsk: (text: string) => void
  readonly onPin: () => void
  readonly onClose: () => void
  readonly onJump: () => void
  readonly onPick: (on: boolean) => void
  readonly onLink: (other: ReaderSession) => void
  readonly onOpenLinked: (other: ReaderSession) => void
}

function SessionBox(props: BoxProps) {
  const { session, sessions, busy, anyBusy, error, picking, t } = props
  const [draft, setDraft] = useState('')
  const bodyRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const body = bodyRef.current
    if (body !== null) body.scrollTop = body.scrollHeight
  }, [session.msgs.length, busy])
  const send = (): void => {
    const text = draft.trim()
    if (text === '' || anyBusy) return
    setDraft('')
    props.onAsk(text)
  }
  const linked = session.links.map(id => sessions.find(other => other.id === id)).filter(other => other !== undefined)
  const others = sessions.filter(other => other.id !== session.id && !session.links.includes(other.id))
  return (
    <div className={session.pinned ? css.boxPinned : css.box} data-box={session.id} data-slot={session.id}>
      <div className={css.boxHead}>
        <span className={css.badge}>{session.n}</span>
        <span className={css.boxTitle}>¶{session.p + 1}</span>
        <button type="button" className={session.pinned ? css.iconOn : css.icon} aria-pressed={session.pinned} title={t('session.pinHint')} onClick={props.onPin}>
          {session.pinned ? t('session.pinned') : t('session.pin')}
        </button>
        <button type="button" className={css.icon} onClick={props.onClose}>{t('session.close')}</button>
      </div>
      <div className={css.boxBody} ref={bodyRef}>
        <button type="button" className={css.quote} title={t('session.goto')} onClick={props.onJump}>“{session.text}”</button>
        {session.msgs.length === 0 && <div className={css.muted}>{t('session.new')}</div>}
        {session.msgs.map((message, index) => (
          <div key={index} className={message.role === 'me' ? css.msgMe : css.msgAi}>
            <div className={css.role}>{message.role === 'me' ? t('session.me') : t('session.ai')}</div>
            <div className={css.msgText}>{message.role === 'ai' ? <Markdown text={message.text} /> : message.text}</div>
          </div>
        ))}
        {busy && <div className={css.muted}>{t('session.thinking')}</div>}
        {error !== '' && <div className={css.error}>{t('failed', { message: error })}</div>}
        <div className={css.row}>
          <input
            className={css.field}
            type="text"
            value={draft}
            placeholder={t('session.placeholder')}
            aria-label={t('session.placeholder')}
            onChange={(event) => { setDraft(event.target.value) }}
            onKeyDown={(event) => { if (event.key === 'Enter' && !event.nativeEvent.isComposing) send() }}
          />
          <button type="button" className={css.primary} disabled={anyBusy || draft.trim() === ''} onClick={send}>{t('session.send')}</button>
        </div>
        <div className={css.row}>
          {linked.map(other => (
            <button key={other.id} type="button" className={css.link} title={t('session.linked', { n: other.n })} onClick={() => { props.onOpenLinked(other) }}>
              ↔ {other.n}<span>{short(other.text, 30)}</span>
            </button>
          ))}
          <button type="button" className={css.button} onClick={() => { props.onPick(!picking) }}>{picking ? t('session.cancel') : t('session.link')}</button>
        </div>
        {picking && (
          <div className={css.picker}>
            {others.length === 0 && <div className={css.muted}>{t('session.noOthers')}</div>}
            {others.map(other => (
              <button key={other.id} type="button" className={css.pick} onClick={() => { props.onLink(other) }}>
                <span className={css.badge}>{other.n}</span>
                <span>¶{other.p + 1} · {short(other.text, 44)}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

interface Selected {
  readonly p: number
  readonly start: number
  readonly end: number
  readonly text: string
  readonly left: number
  readonly top: number
}

/**
 * Render the reader.
 * @param props - the main panel's runtime props and this page's translator.
 * @returns the page.
 */
export function ReaderPage({ t }: ReaderPageProps) {
  const [library, setLibrary] = useState<ReaderDocsPayload | undefined>(undefined)
  const [name, setName] = useState('')
  const [blocks, setBlocks] = useState<readonly ReaderBlock[] | undefined>(undefined)
  const [notes, setNotes] = useState<ReaderNotes>(EMPTY)
  const [open, setOpen] = useState<ReadonlySet<string>>(new Set())
  const [picking, setPicking] = useState('')
  const [busy, setBusy] = useState('')
  const [askError, setAskError] = useState<{ id: string; message: string }>({ id: '', message: '' })
  const [error, setError] = useState('')
  const [saveError, setSaveError] = useState('')
  const [dim, setDim] = useState(true)
  const [wide, setWide] = useState(true)
  const [selected, setSelected] = useState<Selected | undefined>(undefined)
  const [docked, setDocked] = useState<ReadonlySet<string>>(new Set())
  const pageRef = useRef<HTMLDivElement>(null)
  const laneRef = useRef<HTMLDivElement>(null)
  const notesRef = useRef(notes)
  notesRef.current = notes
  const nameRef = useRef(name)
  nameRef.current = name
  const fail = (reason: unknown): string => (reason instanceof Error ? reason.message : String(reason))

  useEffect(() => {
    let live = true
    api<ReaderDocsPayload>(READER_DOCS_ROUTE).then((payload) => {
      if (!live) return
      setLibrary(payload)
      const last = remembered()
      if (payload.docs.some(doc => doc.name === last)) setName(last)
    }).catch((reason: unknown) => { if (live) setError(fail(reason)) })
    return () => { live = false }
  }, [])

  useEffect(() => {
    if (name === '') return
    let live = true
    setBlocks(undefined)
    setError('')
    setOpen(new Set())
    setPicking('')
    api<ReaderDocPayload>(`${READER_DOC_ROUTE}?name=${encodeURIComponent(name)}`).then((payload) => {
      if (!live) return
      setBlocks(payload.blocks)
      setNotes(payload.notes)
      setOpen(new Set(payload.notes.sessions.filter(session => session.pinned).map(session => session.id)))
      remember(name)
      pageRef.current?.scrollTo({ top: 0 })
    }).catch((reason: unknown) => { if (live) setError(fail(reason)) })
    return () => { live = false }
  }, [name])

  /** Apply a change to the notes and save the result for the current document. */
  const update = useCallback((change: (current: ReaderNotes) => ReaderNotes): ReaderNotes => {
    const next = change(notesRef.current)
    notesRef.current = next
    setNotes(next)
    void api(`${READER_NOTES_ROUTE}?name=${encodeURIComponent(nameRef.current)}`, {
      method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify(next),
    }).then(() => { setSaveError('') }).catch((reason: unknown) => { setSaveError(fail(reason)) })
    return next
  }, [])

  const paras = useMemo(() => (blocks ?? []).filter(block => block.kind !== 'heading').map(block => block.text), [blocks])
  const highlights = useMemo(() => notes.highlights.map(item => locate(item, paras)).filter(item => item !== undefined), [notes, paras])
  const sessions = useMemo(() => notes.sessions.map(item => locate(item, paras)).filter(item => item !== undefined), [notes, paras])
  const lost = notes.highlights.length + notes.sessions.length - highlights.length - sessions.length

  const flash = useCallback((p: number): void => {
    const el = pageRef.current?.querySelector<HTMLElement>(`[data-p="${p}"]`)
    if (el === null || el === undefined) return
    el.scrollIntoView({ block: 'center', behavior: calm() ? 'auto' : 'smooth' })
    el.classList.add(css.flash ?? '')
    setTimeout(() => { el.classList.remove(css.flash ?? '') }, 1200)
  }, [])

  /** Open one session; every other closes unless it is pinned or is `keep`. */
  const openSession = useCallback((id: string, keep = ''): void => {
    const pinned = notesRef.current.sessions.filter(session => session.pinned).map(session => session.id)
    setOpen(new Set([...pinned, keep, id].filter(item => item !== '')))
    setPicking('')
  }, [])

  const closeSession = (session: ReaderSession): void => {
    setOpen(current => new Set([...current].filter(id => id !== session.id)))
    setPicking('')
    // A session closed before anything was asked leaves no trace; otherwise closing only unpins it.
    if (session.msgs.length === 0) {
      update(current => ({
        highlights: current.highlights,
        sessions: current.sessions.filter(item => item.id !== session.id)
          .map(item => ({ ...item, links: item.links.filter(id => id !== session.id) })),
      }))
    } else if (session.pinned) {
      update(current => ({ ...current, sessions: current.sessions.map(item => (item.id === session.id ? { ...item, pinned: false } : item)) }))
    }
  }

  const patchSession = (id: string, change: (session: ReaderSession) => ReaderSession): void => {
    update(current => ({ ...current, sessions: current.sessions.map(item => (item.id === id ? change(item) : item)) }))
  }

  const ask = (session: ReaderSession, text: string): void => {
    if (busy !== '') return
    const doc = name
    const next = update(current => ({
      ...current,
      sessions: current.sessions.map(item => (item.id === session.id ? { ...item, msgs: [...item.msgs, { role: 'me' as const, text }] } : item)),
    }))
    const msgs = next.sessions.find(item => item.id === session.id)?.msgs ?? []
    const request: ReaderAskRequest = { name: doc, p: session.p, passage: session.text, msgs }
    setBusy(session.id)
    setAskError({ id: '', message: '' })
    api<ReaderAskPayload>(READER_ASK_ROUTE, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(request) })
      .then((reply) => {
        // A reply for a document the reader has left is dropped instead of being saved into the wrong notes.
        if (nameRef.current !== doc) return
        patchSession(session.id, item => ({ ...item, msgs: [...item.msgs, { role: 'ai', text: reply.text }] }))
      })
      .catch((reason: unknown) => { setAskError({ id: session.id, message: fail(reason) }) })
      .finally(() => { setBusy('') })
  }

  const link = (a: ReaderSession, b: ReaderSession): void => {
    update(current => ({
      ...current,
      sessions: current.sessions.map((item) => {
        const other = item.id === a.id ? b.id : item.id === b.id ? a.id : ''
        return other === '' || item.links.includes(other) ? item : { ...item, links: [...item.links, other] }
      }),
    }))
    openSession(b.id, a.id)
  }

  const overlaps = (p: number, start: number, end: number): boolean =>
    [...highlights, ...sessions].some(item => item.p === p && start < item.end && end > item.start)

  const addHighlight = (range: Selected): void => {
    if (overlaps(range.p, range.start, range.end)) return
    update(current => ({ ...current, highlights: [...current.highlights, { id: newId('h'), p: range.p, start: range.start, end: range.end, text: range.text }] }))
  }

  const addSession = (range: Selected): void => {
    if (overlaps(range.p, range.start, range.end)) return
    const id = newId('s')
    update(current => ({
      ...current,
      sessions: [...current.sessions, {
        id, p: range.p, start: range.start, end: range.end, text: range.text,
        n: Math.max(0, ...current.sessions.map(item => item.n)) + 1, msgs: [], links: [], pinned: false,
      }],
    }))
    openSession(id)
  }

  // Width of the page, not the window, decides the layout: the DSH sidebars take space too.
  useEffect(() => {
    const page = pageRef.current
    if (page === null) return
    const observer = new ResizeObserver(() => { setWide(page.clientWidth > WIDE) })
    observer.observe(page)
    return () => { observer.disconnect() }
  }, [])

  // Scroll-following focus: the paragraph nearest the reading line is fully bright, the rest fade with distance.
  const applyFocus = useCallback((): void => {
    const page = pageRef.current
    if (page === null) return
    const els = [...page.querySelectorAll<HTMLElement>('[data-p]')]
    if (!dim) {
      for (const el of els) el.style.opacity = ''
      return
    }
    const frame = page.getBoundingClientRect()
    const mid = frame.top + frame.height * 0.45
    const span = frame.height * 0.5
    const dist = els.map((el) => {
      const rect = el.getBoundingClientRect()
      return rect.top <= mid && rect.bottom >= mid ? 0 : Math.min(Math.abs(rect.top - mid), Math.abs(rect.bottom - mid)) / span
    })
    const nearest = Math.min(...dist)
    els.forEach((el, index) => { el.style.opacity = String(Math.max(0.28, Math.min(1, 1 - ((dist[index] ?? 0) - nearest) * 1.15))) })
  }, [dim])

  // A held session folds into a chip once the next open session has reached the top, and unfolds when it leaves again.
  const checkDock = useCallback((): void => {
    const lane = laneRef.current
    const page = pageRef.current
    if (lane === null || page === null) return
    const pageTop = page.getBoundingClientRect().top
    const els = [...lane.querySelectorAll<HTMLElement>('[data-slot]')]
    const next = new Set<string>()
    els.forEach((el, index) => {
      const after = els[index + 1]
      const id = el.dataset.slot
      if (after === undefined || id === undefined) {
        el.style.clipPath = ''
        return
      }
      const afterTop = after.getBoundingClientRect().top
      // The arriving session covers the held one from below; the covered part is clipped so the two never overlap.
      const cut = el.getBoundingClientRect().bottom - (afterTop - LANE_GAP)
      el.style.clipPath = cut > 0 && el.dataset.box !== undefined ? `inset(0 0 ${cut}px 0 round 10px)` : ''
      if (afterTop <= pageTop + STICK_TOP + (index + 1) * CHIP_ROW + 0.5) next.add(id)
    })
    setDocked(current => (current.size === next.size && [...next].every(id => current.has(id)) ? current : next))
  }, [])

  useEffect(() => {
    const page = pageRef.current
    if (page === null) return
    let frame = 0
    const queue = (): void => {
      if (frame !== 0) return
      frame = requestAnimationFrame(() => { frame = 0; applyFocus(); checkDock() })
    }
    page.addEventListener('scroll', queue, { passive: true })
    return () => { page.removeEventListener('scroll', queue); cancelAnimationFrame(frame) }
  }, [applyFocus, checkDock])

  const openList = sessions.filter(session => open.has(session.id)).sort((a, b) => a.p - b.p || a.start - b.start)
  const laneOn = wide && openList.length > 0

  // Lane layout. Each open session is a sticky element whose resting place is beside its paragraph, so the browser
  // itself holds it at the top while the reader scrolls on. Only the margins that set those resting places are computed here.
  useLayoutEffect(() => {
    applyFocus()
    const lane = laneRef.current
    const page = pageRef.current
    if (lane === null || page === null || !laneOn) return
    const place = (): void => {
      const laneTop = lane.getBoundingClientRect().top
      let bottom = 0
      lane.querySelectorAll<HTMLElement>('[data-slot]').forEach((el, index) => {
        const session = sessions.find(item => item.id === el.dataset.slot)
        const para = session === undefined ? null : page.querySelector<HTMLElement>(`[data-p="${session.p}"]`)
        if (para === null) return
        const want = para.getBoundingClientRect().top - laneTop
        const top = Math.max(want, bottom + (index === 0 ? 0 : LANE_GAP))
        el.style.marginTop = `${top - bottom}px`
        // Sessions above this one are chips by the time it reaches the top, so it holds just below their rows.
        el.style.top = `${STICK_TOP + index * CHIP_ROW}px`
        bottom = top + el.offsetHeight
      })
      checkDock()
    }
    place()
    const observer = new ResizeObserver(place)
    for (const el of lane.querySelectorAll('[data-slot]')) observer.observe(el)
    return () => { observer.disconnect() }
  })

  // Selection inside one paragraph offers Highlight or Open AI session.
  useEffect(() => {
    let timer = 0
    const read = (): void => {
      const selection = getSelection()
      const page = pageRef.current
      if (selection === null || selection.isCollapsed || selection.rangeCount === 0 || page === null) { setSelected(undefined); return }
      const range = selection.getRangeAt(0)
      const paraOf = (node: Node): HTMLElement | null => (node instanceof Element ? node : node.parentElement)?.closest<HTMLElement>('[data-p]') ?? null
      const para = paraOf(range.startContainer)
      if (para === null || para !== paraOf(range.endContainer) || !page.contains(para)) { setSelected(undefined); return }
      const before = document.createRange()
      before.selectNodeContents(para)
      before.setEnd(range.startContainer, range.startOffset)
      // Offsets are measured in the paragraph's own text, so the paragraph number and session badges are left out.
      const fragment = before.cloneContents()
      fragment.querySelectorAll('[data-skip]').forEach((el) => { el.remove() })
      const start = fragment.textContent?.length ?? 0
      const text = range.toString()
      const p = Number(para.dataset.p)
      if (text.trim().length < 3 || paras[p]?.slice(start, start + text.length) !== text) { setSelected(undefined); return }
      const rect = range.getBoundingClientRect()
      setSelected({ p, start, end: start + text.length, text, left: rect.left + rect.width / 2, top: rect.top })
    }
    const onChange = (): void => { clearTimeout(timer); timer = window.setTimeout(read, 180) }
    document.addEventListener('selectionchange', onChange)
    return () => { document.removeEventListener('selectionchange', onChange); clearTimeout(timer) }
  }, [paras])

  const act = (run: (range: Selected) => void): void => {
    if (selected !== undefined) run(selected)
    getSelection()?.removeAllRanges()
    setSelected(undefined)
  }

  const box = (session: ReaderSession): ReactNode => (
    <SessionBox
      key={session.id}
      session={session}
      sessions={sessions}
      busy={busy === session.id}
      anyBusy={busy !== ''}
      error={askError.id === session.id ? askError.message : ''}
      picking={picking === session.id}
      t={t}
      onAsk={(text) => { ask(session, text) }}
      onPin={() => { patchSession(session.id, item => ({ ...item, pinned: !item.pinned })) }}
      onClose={() => { closeSession(session) }}
      onJump={() => { flash(session.p) }}
      onPick={(on) => { setPicking(on ? session.id : '') }}
      onLink={(other) => { link(session, other) }}
      onOpenLinked={(other) => { openSession(other.id, session.id); flash(other.p) }}
    />
  )

  const paragraph = (block: Exclude<ReaderBlock, { kind: 'heading' }>, p: number): ReactNode => {
    const anchors = [
      ...highlights.filter(item => item.p === p).map(item => ({ item, session: undefined as ReaderSession | undefined })),
      ...sessions.filter(item => item.p === p).map(item => ({ item, session: item as ReaderSession | undefined })),
    ].sort((a, b) => a.item.start - b.item.start)
    const parts: ReactNode[] = []
    let at = 0
    for (const { item, session } of anchors) {
      if (item.start < at) continue
      parts.push(block.text.slice(at, item.start))
      if (session === undefined) {
        parts.push(
          <mark key={item.id} className={css.hl} title={t('highlight.remove')} onClick={() => {
            if (getSelection()?.isCollapsed === false) return
            update(current => ({ ...current, highlights: current.highlights.filter(other => other.id !== item.id) }))
          }}>{item.text}</mark>,
        )
      } else {
        parts.push(
          <mark key={item.id} className={css.anchor} title={t('session.open', { n: session.n })} onClick={() => { openSession(session.id) }}>{item.text}</mark>,
          <button key={`${item.id}-badge`} type="button" data-skip="" className={css.badgeButton} aria-label={t('session.open', { n: session.n })} onClick={() => { openSession(session.id) }}>{session.n}</button>,
        )
      }
      at = item.end
    }
    parts.push(block.text.slice(at))
    return (
      <div key={`p${p}`}>
        <p className={block.kind === 'code' ? css.code : css.para} data-p={p}>
          <span className={css.pn} data-skip="">¶{p + 1}</span>
          {parts}
        </p>
        {!wide && sessions.filter(item => item.p === p).map(session => (
          <div key={session.id} className={css.inlineSlot}>
            {open.has(session.id) ? box(session) : (
              <button type="button" className={css.folded} onClick={() => { openSession(session.id) }}>
                <span className={css.badge}>{session.n}</span>
                <span className={css.grow}>{session.msgs.length > 0 ? short(session.msgs.at(-1)?.text ?? '', 80) : t('session.blank')}</span>
                <span className={css.muted}>{t('session.count', { count: session.msgs.length })}</span>
              </button>
            )}
          </div>
        ))}
      </div>
    )
  }

  let p = -1
  const body = (blocks ?? []).map((block, index) => {
    if (block.kind === 'heading') {
      const Tag = block.level <= 1 ? 'h1' : block.level === 2 ? 'h2' : 'h3'
      return <Tag key={`h${index}`} className={css[Tag]}>{block.text}</Tag>
    }
    p += 1
    return paragraph(block, p)
  })

  return (
    <div className={css.page} ref={pageRef}>
      <div className={css.bar}>
        <select className={css.select} value={name} aria-label={t('choose')} onChange={(event) => { setName(event.target.value) }}>
          <option value="" disabled>{t('choose')}</option>
          {(library?.docs ?? []).map(doc => <option key={doc.name} value={doc.name}>{doc.name}</option>)}
        </select>
        <label className={css.toggle}>
          <input type="checkbox" checked={dim} onChange={(event) => { setDim(event.target.checked) }} />
          {t('fade')}
        </label>
      </div>
      {error !== '' && <p className={css.error}>{t('failed', { message: error })}</p>}
      {saveError !== '' && <p className={css.error}>{t('save.failed', { message: saveError })}</p>}
      {library !== undefined && library.docs.length === 0 && (
        <div className={css.empty}>
          <strong>{t('empty.title')}</strong>
          <span>{t('empty.body', { folder: library.libraryDir })}</span>
        </div>
      )}
      {library !== undefined && library.docs.length > 0 && name === '' && <div className={css.empty}>{t('pick.title')}</div>}
      {name !== '' && blocks === undefined && error === '' && <div className={css.empty}>{t('loading')}</div>}
      {blocks !== undefined && (
        <div className={laneOn ? css.gridLane : css.grid}>
          <article className={css.paper}>
            {lost > 0 && <p className={css.muted}>{t('moved', { count: lost })}</p>}
            {body}
          </article>
          {laneOn && (
            <div className={css.lane} ref={laneRef}>
              {openList.map(session => (docked.has(session.id) ? (
                <button key={session.id} type="button" data-slot={session.id} className={css.laneChip} title={t('session.goto')} onClick={() => { flash(session.p) }}>
                  <span className={css.badge}>{session.n}</span>
                  <span>↑ ¶{session.p + 1}</span>
                  <span className={css.grow}>{session.msgs.length > 0 ? short(session.msgs.at(-1)?.text ?? '', 80) : t('session.blank')}</span>
                </button>
              ) : box(session)))}
            </div>
          )}
        </div>
      )}
      {selected !== undefined && (
        <div className={css.selbar} style={{ left: selected.left, top: selected.top }}>
          <button type="button" onPointerDown={(event) => { event.preventDefault() }} onClick={() => { act(addHighlight) }}>{t('select.highlight')}</button>
          <button type="button" onPointerDown={(event) => { event.preventDefault() }} onClick={() => { act(addSession) }}>{t('select.session')}</button>
        </div>
      )}
    </div>
  )
}
