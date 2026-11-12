/**
 * The voyage data file: every day's three steps and every captured thought,
 * kept as one JSON file in the configured folder. Functions here are pure
 * except {@link readStore} and {@link writeStore}.
 */

import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import { join, resolve } from 'node:path'
import { STEP_COUNT, type VoyageDay, type VoyageStep, type VoyageThought } from './shared.ts'

/** A request that cannot be served, with the HTTP status that reports it. */
export class StoreError extends Error {
  /**
   * @param status - HTTP status for the response.
   * @param message - reason shown to the person.
   */
  constructor(readonly status: number, message: string) {
    super(message)
  }
}

/** Everything the plugin saves. */
export interface VoyageFile {
  readonly days: Readonly<Record<string, readonly VoyageStep[]>>
  readonly thoughts: readonly VoyageThought[]
}

const FILE_NAME = 'voyage.json'
const DATE = /^\d{4}-\d{2}-\d{2}$/

/**
 * Resolve the configured folder, expanding a leading `~`.
 * @param dir - configured folder.
 * @returns absolute path.
 */
export function expandDir(dir: string): string {
  return resolve(dir === '~' || dir.startsWith('~/') ? join(homedir(), dir.slice(1)) : dir)
}

/**
 * Check a calendar date string.
 * @param value - candidate from a request.
 * @returns the date.
 */
export function requireDate(value: unknown): string {
  if (typeof value !== 'string' || !DATE.test(value)) throw new StoreError(400, 'date must be YYYY-MM-DD')
  return value
}

function cleanSteps(value: unknown): VoyageStep[] {
  const list = Array.isArray(value) ? value : []
  return Array.from({ length: STEP_COUNT }, (_, index) => {
    const step = typeof list[index] === 'object' && list[index] !== null ? list[index] as Record<string, unknown> : {}
    return { text: typeof step.text === 'string' ? step.text : '', done: step.done === true }
  })
}

/**
 * Keep the well-formed parts of a parsed data file.
 * @param value - parsed JSON of unknown structure.
 * @returns a data file with exactly three steps per day and only complete thoughts.
 */
export function cleanFile(value: unknown): VoyageFile {
  const fields = typeof value === 'object' && value !== null ? value as Record<string, unknown> : {}
  const rawDays = typeof fields.days === 'object' && fields.days !== null ? fields.days as Record<string, unknown> : {}
  const days: Record<string, VoyageStep[]> = {}
  for (const [date, steps] of Object.entries(rawDays)) if (DATE.test(date)) days[date] = cleanSteps(steps)
  const thoughts: VoyageThought[] = []
  for (const item of Array.isArray(fields.thoughts) ? fields.thoughts : []) {
    const thought = typeof item === 'object' && item !== null ? item as Record<string, unknown> : {}
    if (typeof thought.id !== 'string' || thought.id === '' || typeof thought.text !== 'string' || thought.text.trim() === '') continue
    thoughts.push({
      id: thought.id,
      text: thought.text,
      created: typeof thought.created === 'string' ? thought.created : '',
      group: typeof thought.group === 'string' ? thought.group : '',
      done: thought.done === true,
    })
  }
  return { days, thoughts }
}

/**
 * Read the data file.
 * @param dir - absolute data folder.
 * @returns the saved data, or an empty file when none exists yet.
 */
export async function readStore(dir: string): Promise<VoyageFile> {
  let text: string
  try {
    text = await readFile(join(dir, FILE_NAME), 'utf8')
  } catch (error: unknown) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return { days: {}, thoughts: [] }
    throw error
  }
  try {
    return cleanFile(JSON.parse(text))
  } catch (error: unknown) {
    void error
    // Refusing keeps a damaged file from being replaced by an empty one on the next save.
    throw new StoreError(500, `${join(dir, FILE_NAME)} is not valid JSON; fix or move it, then reload`)
  }
}

/**
 * Replace the data file through a temporary file and a rename.
 * @param dir - absolute data folder.
 * @param file - data to save.
 */
export async function writeStore(dir: string, file: VoyageFile): Promise<void> {
  await mkdir(dir, { recursive: true })
  const target = join(dir, FILE_NAME)
  const temp = `${target}.${process.pid}.tmp`
  await writeFile(temp, `${JSON.stringify(file, null, 2)}\n`, 'utf8')
  await rename(temp, target)
}

/**
 * One day's steps.
 * @param file - data file.
 * @param date - calendar date.
 * @returns the saved steps, or three empty ones.
 */
export function dayOf(file: VoyageFile, date: string): VoyageDay {
  return { date, steps: file.days[date] ?? cleanSteps([]) }
}

/**
 * Replace one day's steps.
 * @param file - data file.
 * @param date - calendar date.
 * @param steps - steps from a request.
 * @returns the changed data file.
 */
export function withDay(file: VoyageFile, date: string, steps: unknown): VoyageFile {
  return { ...file, days: { ...file.days, [date]: cleanSteps(steps) } }
}

/**
 * Add a captured thought.
 * @param file - data file.
 * @param thought - id, text and capture time.
 * @param max - most thoughts the file may hold.
 * @returns the changed data file.
 */
export function withThought(file: VoyageFile, thought: { id: string; text: string; created: string }, max: number): VoyageFile {
  const text = thought.text.trim()
  if (text === '') throw new StoreError(400, 'a thought needs some text')
  if (file.thoughts.length >= max) throw new StoreError(409, `the waiting list is full (${max}); mark some thoughts done first`)
  return { ...file, thoughts: [...file.thoughts, { id: thought.id, text, created: thought.created, group: '', done: false }] }
}

/**
 * Mark one thought done or not done.
 * @param file - data file.
 * @param id - thought id.
 * @param done - new state.
 * @returns the changed data file.
 */
export function withDone(file: VoyageFile, id: string, done: boolean): VoyageFile {
  if (!file.thoughts.some(thought => thought.id === id)) throw new StoreError(404, 'that thought no longer exists')
  return { ...file, thoughts: file.thoughts.map(thought => (thought.id === id ? { ...thought, done } : thought)) }
}

/**
 * The text given to the model for one sort. Thoughts are numbered from 1 so the reply can refer to them briefly.
 * @param open - thoughts to sort, in order.
 * @param groups - group names to choose from.
 * @returns prompt text.
 */
export function sortRequest(open: readonly VoyageThought[], groups: readonly string[]): string {
  return [
    `Groups:\n${groups.map(group => `- ${group}`).join('\n')}`,
    `Thoughts:\n${open.map((thought, index) => `${index + 1}. ${thought.text.replace(/\s+/g, ' ')}`).join('\n')}`,
    'Reply with only a JSON object whose keys are the thought numbers and whose values are group names copied exactly from the list.',
  ].join('\n\n')
}

/**
 * Apply a model reply to the open thoughts.
 * @param file - data file.
 * @param open - the thoughts that were sent, in the order they were numbered.
 * @param reply - model text containing one JSON object.
 * @param groups - allowed group names.
 * @returns the changed data file; a thought the reply leaves out or gives an unknown group keeps its current group.
 */
export function withGroups(file: VoyageFile, open: readonly VoyageThought[], reply: string, groups: readonly string[]): VoyageFile {
  const start = reply.indexOf('{')
  const end = reply.lastIndexOf('}')
  let parsed: unknown
  try {
    parsed = JSON.parse(reply.slice(start, end + 1))
  } catch (error: unknown) {
    void error
    throw new StoreError(502, 'the model did not return a sortable answer; nothing was changed')
  }
  const answers = typeof parsed === 'object' && parsed !== null ? parsed as Record<string, unknown> : {}
  const chosen = new Map<string, string>()
  open.forEach((thought, index) => {
    const group = answers[String(index + 1)]
    if (typeof group === 'string' && groups.includes(group)) chosen.set(thought.id, group)
  })
  if (chosen.size === 0) throw new StoreError(502, 'the model did not place any thought in a known group; nothing was changed')
  return { ...file, thoughts: file.thoughts.map(thought => ({ ...thought, group: chosen.get(thought.id) ?? thought.group })) }
}
