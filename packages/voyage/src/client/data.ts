/**
 * Browser copy of the voyage data, shared by the page, the side panel and the
 * capture box. Every change is sent to the Host and the Host's answer replaces
 * the copy, so all three always show what was saved.
 */
import { useSyncExternalStore } from 'react'
import {
  VOYAGE_DAY_ROUTE, VOYAGE_SORT_ROUTE, VOYAGE_STATE_ROUTE, VOYAGE_THOUGHT_ROUTE,
  type VoyageStatePayload, type VoyageStep,
} from '../shared.ts'

/** What the pages render from. */
export interface VoyageView {
  /** Saved data, or undefined until the first load answers. */
  readonly state: VoyageStatePayload | undefined
  /** Message of the last failed request; cleared by the next success. */
  readonly error: string
  readonly sorting: boolean
}

let view: VoyageView = { state: undefined, error: '', sorting: false }
const listeners = new Set<() => void>()

function set(patch: Partial<VoyageView>): void {
  view = { ...view, ...patch }
  for (const listener of listeners) listener()
}

/** Today's local calendar date as `YYYY-MM-DD`. */
export function today(): string {
  const now = new Date()
  const pad = (value: number): string => String(value).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

async function send(route: string, method: string, body?: Record<string, unknown>): Promise<boolean> {
  try {
    const response = await fetch(body === undefined ? `${route}?date=${today()}` : route, {
      method,
      headers: { accept: 'application/json', ...(body === undefined ? {} : { 'content-type': 'application/json' }) },
      ...(body === undefined ? {} : { body: JSON.stringify({ date: today(), ...body }) }),
    })
    const payload = await response.json() as VoyageStatePayload & { error?: string }
    if (!response.ok) throw new Error(payload.error ?? `HTTP ${response.status}`)
    set({ state: payload, error: '' })
    return true
  } catch (error: unknown) {
    set({ error: error instanceof Error ? error.message : String(error) })
    return false
  }
}

/** Load today's steps and every thought. */
export function loadVoyage(): Promise<boolean> {
  return send(VOYAGE_STATE_ROUTE, 'GET')
}

/**
 * Replace today's steps. The copy changes at once so typing and ticking feel immediate; a failed save shows the error.
 * @param steps - all three steps.
 */
export function saveSteps(steps: readonly VoyageStep[]): Promise<boolean> {
  if (view.state !== undefined) set({ state: { ...view.state, day: { ...view.state.day, steps } } })
  return send(VOYAGE_DAY_ROUTE, 'PUT', { steps })
}

/**
 * File one captured thought.
 * @param text - the thought.
 * @returns whether it was saved.
 */
export function captureThought(text: string): Promise<boolean> {
  return send(VOYAGE_THOUGHT_ROUTE, 'POST', { text })
}

/**
 * Mark a thought done or bring it back.
 * @param id - thought id.
 * @param done - new state.
 */
export function setThoughtDone(id: string, done: boolean): Promise<boolean> {
  return send(VOYAGE_THOUGHT_ROUTE, 'PUT', { id, done })
}

/** Ask the model to group the open thoughts. */
export async function sortThoughts(): Promise<boolean> {
  set({ sorting: true })
  const ok = await send(VOYAGE_SORT_ROUTE, 'POST', {})
  set({ sorting: false })
  return ok
}

const subscribe = (listener: () => void): (() => void) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/**
 * Subscribe a component to the shared copy.
 * @returns the current view.
 */
export function useVoyage(): VoyageView {
  return useSyncExternalStore(subscribe, () => view)
}
