/**
 * The voyage page: a night-sea scene with today's next step, the Waiting
 * list of captured thoughts, and a side panel holding the day's three steps.
 */
import { useEffect, useMemo, useRef, useState } from 'react'
import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type {} from '@deepseek-ai/dsh-client-ui-layout/client'
import { STEP_COUNT, type VoyageStep, type VoyageThought } from '../shared.ts'
import { setCaptureOpen } from './capture.ts'
import { loadVoyage, saveSteps, setThoughtDone, sortThoughts, useVoyage } from './data.ts'
import { Scene } from './Scene.tsx'
import css from './Voyage.module.css'

type VoyagePageProps = PropsRuntime<'main'> & PropsLocale<'voyage'>
type T = VoyagePageProps['t']

const KINDS = ['deepSea', 'boat', 'fire'] as const
/** Typing pauses this long before the steps are saved, in milliseconds. */
const SAVE_DELAY_MS = 700
const SIDE_KEY = 'voyage:side'
const EMPTY_STEPS: readonly VoyageStep[] = Array.from({ length: STEP_COUNT }, () => ({ text: '', done: false }))

function rememberedSide(): boolean {
  try {
    return localStorage.getItem(SIDE_KEY) !== 'shut'
  } catch (error: unknown) {
    // Storage can be blocked; the panel then starts open.
    void error
    return true
  }
}

function SidePanel({ t, steps, waiting, latest, onSteps, onHide }: {
  readonly t: T
  readonly steps: readonly VoyageStep[]
  readonly waiting: number
  readonly latest: readonly VoyageThought[]
  readonly onSteps: (steps: readonly VoyageStep[], now: boolean) => void
  readonly onHide: () => void
}) {
  const change = (index: number, patch: Partial<VoyageStep>, now: boolean): void => {
    onSteps(steps.map((step, at) => (at === index ? { ...step, ...patch } : step)), now)
  }
  return (
    <aside className={css.side}>
      <button type="button" className={css.fold} onClick={onHide}>{t('side.hide')} ›</button>
      <section className={css.widget}>
        <span className={css.small}>{new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}</span>
        <h2 className={css.title}>{t('course.title')}</h2>
        {KINDS.map((kind, index) => {
          const step = steps[index] ?? { text: '', done: false }
          return (
            <div key={kind} className={css.step}>
              <button type="button" className={step.done ? css.tickOn : css.tick} aria-pressed={step.done} aria-label={t('course.tick', { kind: t(`course.${kind}`) })} disabled={step.text.trim() === ''} onClick={() => { change(index, { done: !step.done }, true) }}>✓</button>
              <label className={css.stepBody}>
                <span className={css.kind}>{t(`course.${kind}`)}</span>
                <input className={step.done ? css.stepInputDone : css.stepInput} value={step.text} placeholder={t(`course.${kind}.hint`)} onChange={(event) => { change(index, { text: event.target.value }, false) }} />
              </label>
            </div>
          )
        })}
      </section>
      <section className={css.widget}>
        <button type="button" className={css.capture} onClick={() => { setCaptureOpen(true) }}>{t('capture.button')}</button>
        <span className={css.small}>{t('capture.count', { count: waiting })}</span>
        {latest.map(thought => <p key={thought.id} className={css.peek}>{thought.text}</p>)}
      </section>
    </aside>
  )
}

function Waiting({ t, open, groups, sorting }: { readonly t: T; readonly open: readonly VoyageThought[]; readonly groups: readonly string[]; readonly sorting: boolean }) {
  const row = (thought: VoyageThought) => (
    <div key={thought.id} className={css.row}>
      <span className={css.rowText}>{thought.text}</span>
      <button type="button" className={css.rowDone} onClick={() => { void setThoughtDone(thought.id, true) }}>{t('waiting.done')}</button>
    </div>
  )
  const sorted = open.some(thought => thought.group !== '')
  const unsorted = open.filter(thought => !groups.includes(thought.group))
  return (
    <div className={css.column}>
      <div className={css.head}>
        <div>
          <h2 className={css.title}>{t('waiting.title')}</h2>
          <span className={css.small}>{t('waiting.lead')}</span>
        </div>
        <button type="button" className={css.sort} disabled={sorting || open.length === 0} onClick={() => { void sortThoughts() }}>{sorting ? t('waiting.sorting') : t('waiting.sort')}</button>
      </div>
      {open.length === 0 && <p className={css.small}>{t('waiting.empty')}</p>}
      {!sorted && open.map(row)}
      {sorted && groups.map((group) => {
        const members = open.filter(thought => thought.group === group)
        return members.length === 0 ? null : <section key={group} className={css.group}><h3 className={css.groupName}>{group} · {members.length}</h3>{members.map(row)}</section>
      })}
      {sorted && unsorted.length > 0 && <section className={css.group}><h3 className={css.groupName}>{t('waiting.unsorted')} · {unsorted.length}</h3>{unsorted.map(row)}</section>}
    </div>
  )
}

/**
 * Render the voyage page.
 * @param props - the main slot's runtime share and this plugin's translator.
 * @returns the page.
 */
export function VoyagePage({ t }: VoyagePageProps) {
  const { state, error, sorting } = useVoyage()
  const [tab, setTab] = useState<'home' | 'waiting'>('home')
  const [side, setSide] = useState(rememberedSide)
  // The inputs edit this copy; it is filled from the Host once and saved back after a pause in typing.
  const [steps, setSteps] = useState<readonly VoyageStep[] | undefined>(undefined)
  const timer = useRef(0)

  useEffect(() => { void loadVoyage() }, [])
  useEffect(() => {
    if (steps === undefined && state !== undefined) setSteps(state.day.steps)
  }, [state, steps])
  useEffect(() => () => { window.clearTimeout(timer.current) }, [])

  const shown = steps ?? EMPTY_STEPS
  const open = useMemo(() => (state?.thoughts ?? []).filter(thought => !thought.done), [state])
  const onSteps = (next: readonly VoyageStep[], now: boolean): void => {
    setSteps(next)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => { void saveSteps(next) }, now ? 0 : SAVE_DELAY_MS)
  }
  const toggleSide = (next: boolean): void => {
    setSide(next)
    try {
      localStorage.setItem(SIDE_KEY, next ? 'open' : 'shut')
    } catch (error_: unknown) {
      // Storage can be blocked; the choice then lasts until the page reloads.
      void error_
    }
  }

  const written = shown.filter(step => step.text.trim() !== '')
  const nextIndex = shown.findIndex(step => step.text.trim() !== '' && !step.done)
  const allDone = written.length === STEP_COUNT && nextIndex === -1
  const nextKind = KINDS[nextIndex]

  return (
    <div className={css.page}>
      <Scene kind={tab} progress={written.filter(step => step.done).length} lanterns={open.length} />
      <div className={css.stage}>
        <nav className={css.tabs}>
          <button type="button" className={tab === 'home' ? css.tabOn : css.tab} aria-current={tab === 'home' ? 'page' : undefined} onClick={() => { setTab('home') }}>{t('tab.home')}</button>
          <button type="button" className={tab === 'waiting' ? css.tabOn : css.tab} aria-current={tab === 'waiting' ? 'page' : undefined} onClick={() => { setTab('waiting') }}>{t('tab.waiting', { count: open.length })}</button>
        </nav>
        {error !== '' && <p className={css.error} role="alert">{t('failed', { message: error })}</p>}
        {state === undefined && error === '' && <p className={css.small}>{t('loading')}</p>}
        {tab === 'waiting' && state !== undefined && <Waiting t={t} open={open} groups={state.groups} sorting={sorting} />}
        {tab === 'home' && state !== undefined && (
          <div className={css.next}>
            <span className={css.small}>{nextKind === undefined ? t('next.today') : t('next.label', { kind: t(`course.${nextKind}`) })}</span>
            <h2 className={css.title}>{nextKind === undefined ? (allDone ? t('next.allDone') : t('next.unset')) : shown[nextIndex]?.text}</h2>
          </div>
        )}
      </div>
      {side
        ? <SidePanel t={t} steps={shown} waiting={open.length} latest={open.slice(-2).reverse()} onSteps={onSteps} onHide={() => { toggleSide(false) }} />
        : <button type="button" className={css.unfold} aria-label={t('side.show')} title={t('side.show')} onClick={() => { toggleSide(true) }}>‹</button>}
    </div>
  )
}
