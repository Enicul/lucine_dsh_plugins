/**
 * Library folder access: list documents, parse one into blocks, and read or
 * replace its saved notes. Documents are opened for reading only; notes live in
 * `<libraryDir>/.focus-reader/<document name>.json`.
 */

import { mkdir, readdir, readFile, rename, stat, writeFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import { dirname, extname, join, resolve, sep } from 'node:path'
import type { ReaderAnchor, ReaderBlock, ReaderDocEntry, ReaderMessage, ReaderNotes, ReaderSession } from './shared.ts'

const NOTES_DIR = '.focus-reader'
const EXTENSIONS = new Set(['.md', '.markdown', '.txt'])
const EMPTY: ReaderNotes = { highlights: [], sessions: [] }

/** A request that names something outside the library or of the wrong form. */
export class LibraryError extends Error {
  /**
   * @param status - HTTP status the route answers with.
   * @param message - text shown to the reader.
   */
  constructor(readonly status: 400 | 404 | 413 | 502, message: string) {
    super(message)
  }
}

/**
 * Expand a leading `~` to the home directory and make the path absolute.
 * @param dir - configured folder.
 * @returns absolute folder path.
 */
export function expandDir(dir: string): string {
  return resolve(dir === '~' || dir.startsWith('~/') ? join(homedir(), dir.slice(1)) : dir)
}

/**
 * Resolve a document name inside the library folder.
 * @param libraryDir - absolute library folder.
 * @param name - path relative to the library, with `/` separators.
 * @returns absolute file path.
 * @throws {LibraryError} when the name leaves the folder, enters a dot folder, or is not a text document.
 */
export function resolveDoc(libraryDir: string, name: string): string {
  if (!EXTENSIONS.has(extname(name).toLowerCase())) throw new LibraryError(400, 'only .md, .markdown and .txt files can be read')
  return resolveInside(libraryDir, name)
}

function resolveInside(libraryDir: string, name: string): string {
  const parts = name.split('/')
  if (name === '' || parts.some(part => part === '' || part.startsWith('.'))) {
    throw new LibraryError(400, 'invalid document name')
  }
  const path = resolve(libraryDir, ...parts)
  if (!path.startsWith(libraryDir + sep)) throw new LibraryError(400, 'invalid document name')
  return path
}

/** Picture file types the library serves, with the media type each is sent as. */
const PICTURE_TYPES: Readonly<Record<string, string>> = {
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.webp': 'image/webp', '.svg': 'image/svg+xml',
}

/**
 * Resolve a picture name inside the library folder.
 * @param libraryDir - absolute library folder.
 * @param name - path relative to the library, with `/` separators.
 * @returns the absolute file path and the media type of its extension.
 * @throws {LibraryError} when the name leaves the folder, enters a dot folder, or is not a picture file.
 */
export function resolvePicture(libraryDir: string, name: string): { path: string; type: string } {
  const type = PICTURE_TYPES[extname(name).toLowerCase()]
  if (type === undefined) throw new LibraryError(400, 'only .png, .jpg, .gif, .webp and .svg pictures can be shown')
  return { path: resolveInside(libraryDir, name), type }
}

/**
 * Read one picture of the library.
 * @param libraryDir - absolute library folder.
 * @param name - picture name relative to the library.
 * @param maxBytes - larger files are refused.
 * @returns the file's bytes and media type.
 * @throws {LibraryError} when the picture is missing, too large, or badly named.
 */
export async function readPicture(libraryDir: string, name: string, maxBytes: number): Promise<{ bytes: Buffer; type: string }> {
  const { path, type } = resolvePicture(libraryDir, name)
  let size: number
  try {
    size = (await stat(path)).size
  } catch (error: unknown) {
    void error
    throw new LibraryError(404, 'no such picture')
  }
  if (size > maxBytes) throw new LibraryError(413, `picture is larger than ${maxBytes} bytes`)
  return { bytes: await readFile(path), type }
}

/**
 * Add a picture to the library, writing a temporary file first so an interrupted write leaves no partial picture.
 * @param libraryDir - absolute library folder.
 * @param name - picture name relative to the library.
 * @param bytes - file content.
 * @throws {LibraryError} when the name is not a picture name inside the library.
 */
export async function savePicture(libraryDir: string, name: string, bytes: Uint8Array): Promise<void> {
  const { path } = resolvePicture(libraryDir, name)
  await mkdir(dirname(path), { recursive: true })
  const temporary = `${path}.${process.pid}.tmp`
  await writeFile(temporary, bytes)
  await rename(temporary, path)
}

/**
 * List every text document under the library folder, newest first.
 * @param libraryDir - absolute library folder; a missing folder lists nothing.
 * @param maxDocs - listing stops after this many documents.
 * @returns document entries.
 */
export async function listDocs(libraryDir: string, maxDocs: number): Promise<ReaderDocEntry[]> {
  const out: ReaderDocEntry[] = []
  const walk = async (dir: string, prefix: string): Promise<void> => {
    let names: string[]
    try {
      names = await readdir(dir)
    } catch (error: unknown) {
      // A folder that does not exist yet, or cannot be read, contributes no documents.
      void error
      return
    }
    for (const name of names.sort()) {
      if (out.length >= maxDocs) return
      if (name.startsWith('.') || name === 'node_modules') continue
      const path = join(dir, name)
      const info = await stat(path)
      if (info.isDirectory()) await walk(path, `${prefix}${name}/`)
      else if (EXTENSIONS.has(extname(name).toLowerCase())) {
        out.push({ name: prefix + name, bytes: info.size, modified: info.mtime.toISOString() })
      }
    }
  }
  await walk(libraryDir, '')
  return out.sort((a, b) => (a.modified < b.modified ? 1 : a.modified > b.modified ? -1 : 0))
}

/**
 * Split Markdown or plain text into headings, paragraphs and fenced code.
 * Paragraph text keeps its inline Markdown characters, so saved character
 * offsets refer to the file's own text.
 * @param source - file content.
 * @returns blocks in document order.
 */
export function parseBlocks(source: string): ReaderBlock[] {
  const blocks: ReaderBlock[] = []
  let para: string[] = []
  let code: string[] | undefined
  const flush = (): void => {
    if (para.length > 0) blocks.push({ kind: 'para', text: para.join('\n') })
    para = []
  }
  for (const line of source.replace(/\r\n?/g, '\n').split('\n')) {
    if (code !== undefined) {
      if (/^\s*(```|~~~)/.test(line)) {
        blocks.push({ kind: 'code', text: code.join('\n') })
        code = undefined
      } else code.push(line)
      continue
    }
    if (/^\s*(```|~~~)/.test(line)) {
      flush()
      code = []
      continue
    }
    const heading = /^(#{1,6})\s+(.*?)\s*#*\s*$/.exec(line)
    if (heading !== null) {
      flush()
      blocks.push({ kind: 'heading', level: (heading[1] ?? '').length, text: heading[2] ?? '' })
    } else if (line.trim() === '') flush()
    else para.push(line.trimEnd())
  }
  if (code !== undefined) blocks.push({ kind: 'code', text: code.join('\n') })
  flush()
  return blocks
}

/**
 * Read and parse one document.
 * @param libraryDir - absolute library folder.
 * @param name - document name relative to the library.
 * @param maxBytes - larger files are refused.
 * @returns the document's blocks.
 * @throws {LibraryError} when the document is missing, too large, or badly named.
 */
export async function readDoc(libraryDir: string, name: string, maxBytes: number): Promise<ReaderBlock[]> {
  const path = resolveDoc(libraryDir, name)
  let size: number
  try {
    size = (await stat(path)).size
  } catch (error: unknown) {
    void error
    throw new LibraryError(404, 'no such document')
  }
  if (size > maxBytes) throw new LibraryError(413, `document is larger than ${maxBytes} bytes`)
  return parseBlocks(await readFile(path, 'utf8'))
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function anchorOf(value: unknown): ReaderAnchor | undefined {
  if (!isRecord(value)) return undefined
  const { id, p, start, end, text } = value
  if (typeof id !== 'string' || id === '' || typeof text !== 'string') return undefined
  if (!Number.isInteger(p) || !Number.isInteger(start) || !Number.isInteger(end)) return undefined
  if ((p as number) < 0 || (start as number) < 0 || (end as number) <= (start as number)) return undefined
  return { id, p: p as number, start: start as number, end: end as number, text }
}

function messageOf(value: unknown): ReaderMessage | undefined {
  if (!isRecord(value) || typeof value.text !== 'string') return undefined
  return value.role === 'me' || value.role === 'ai' ? { role: value.role, text: value.text } : undefined
}

/**
 * Validate notes read from disk or received from the browser.
 * @param value - parsed JSON.
 * @returns the notes with malformed entries removed and links to missing sessions dropped.
 */
export function cleanNotes(value: unknown): ReaderNotes {
  if (!isRecord(value)) return EMPTY
  const highlights = (Array.isArray(value.highlights) ? value.highlights : [])
    .map(anchorOf).filter(item => item !== undefined)
  const sessions: ReaderSession[] = []
  for (const raw of Array.isArray(value.sessions) ? value.sessions : []) {
    const anchor = anchorOf(raw)
    if (anchor === undefined || !isRecord(raw) || !Number.isInteger(raw.n)) continue
    sessions.push({
      ...anchor,
      // Notes saved before comments existed carry no kind; all of them are model discussions.
      kind: raw.kind === 'comment' ? 'comment' : 'ai',
      n: raw.n as number,
      msgs: (Array.isArray(raw.msgs) ? raw.msgs : []).map(messageOf).filter(item => item !== undefined),
      links: (Array.isArray(raw.links) ? raw.links : []).filter((id): id is string => typeof id === 'string'),
      pinned: raw.pinned === true,
    })
  }
  const ids = new Set(sessions.map(session => session.id))
  return {
    highlights,
    sessions: sessions.map(session => ({ ...session, links: session.links.filter(id => ids.has(id) && id !== session.id) })),
  }
}

function notesPath(libraryDir: string, name: string): string {
  resolveDoc(libraryDir, name)
  return join(libraryDir, NOTES_DIR, `${name}.json`)
}

/**
 * Read one document's saved notes.
 * @param libraryDir - absolute library folder.
 * @param name - document name relative to the library.
 * @returns saved notes, or empty notes when none were saved.
 * @throws {SyntaxError} when the notes file exists but is not JSON, so it is never silently replaced.
 */
export async function readNotes(libraryDir: string, name: string): Promise<ReaderNotes> {
  let raw: string
  try {
    raw = await readFile(notesPath(libraryDir, name), 'utf8')
  } catch (error: unknown) {
    if (isRecord(error) && error.code === 'ENOENT') return EMPTY
    throw error
  }
  return cleanNotes(JSON.parse(raw))
}

/**
 * Replace one document's saved notes, writing a temporary file first so an interrupted write leaves the old notes.
 * @param libraryDir - absolute library folder.
 * @param name - document name relative to the library.
 * @param notes - validated notes.
 */
export async function writeNotes(libraryDir: string, name: string, notes: ReaderNotes): Promise<void> {
  const path = notesPath(libraryDir, name)
  await mkdir(dirname(path), { recursive: true })
  const temporary = `${path}.${process.pid}.tmp`
  await writeFile(temporary, `${JSON.stringify(notes, null, 2)}\n`, 'utf8')
  await rename(temporary, path)
}

/**
 * Find a document in one library folder by the start of its file name.
 * @param libraryDir - absolute library folder.
 * @param folder - folder relative to the library, with `/` separators.
 * @param prefix - the file name equals `<prefix>.md` or starts with `<prefix> `.
 * @returns the document name relative to the library, or `undefined` when no file matches or the folder is missing.
 */
export async function findDoc(libraryDir: string, folder: string, prefix: string): Promise<string | undefined> {
  resolveDoc(libraryDir, `${folder}/x.md`)
  let names: string[]
  try {
    names = await readdir(resolve(libraryDir, ...folder.split('/')))
  } catch (error: unknown) {
    if (isRecord(error) && error.code === 'ENOENT') return undefined
    throw error
  }
  const found = names.sort().find(name => name === `${prefix}.md` || (name.startsWith(`${prefix} `) && name.endsWith('.md')))
  return found === undefined ? undefined : `${folder}/${found}`
}

/**
 * Add a document to the library, writing a temporary file first so an interrupted write leaves no partial document.
 * @param libraryDir - absolute library folder.
 * @param name - document name relative to the library.
 * @param text - document content.
 * @throws {LibraryError} when the name is not a readable document name inside the library.
 */
export async function saveDoc(libraryDir: string, name: string, text: string): Promise<void> {
  const path = resolveDoc(libraryDir, name)
  await mkdir(dirname(path), { recursive: true })
  const temporary = `${path}.${process.pid}.tmp`
  await writeFile(temporary, text, 'utf8')
  await rename(temporary, path)
}

/**
 * Text given to the model around a passage: the numbered block holding it and its neighbours.
 * @param blocks - the document's blocks.
 * @param p - index of the anchored numbered block.
 * @param radius - numbered blocks included on each side.
 * @returns the neighbouring text with the nearest preceding heading first.
 */
export function contextAround(blocks: readonly ReaderBlock[], p: number, radius: number): string {
  const lines: string[] = []
  let heading = ''
  let index = -1
  for (const block of blocks) {
    if (block.kind === 'heading') {
      if (index < p - radius) heading = block.text
      else if (index < p + radius) lines.push(`## ${block.text}`)
      continue
    }
    index += 1
    if (index < p - radius || index > p + radius) continue
    lines.push(`[${index + 1}] ${block.text}`)
  }
  return [heading === '' ? '' : `## ${heading}`, ...lines].filter(line => line !== '').join('\n\n')
}
