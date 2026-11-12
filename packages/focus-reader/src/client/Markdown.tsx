/**
 * Small Markdown renderer for session messages: paragraphs, headings, bullet
 * and numbered lists, fenced code, and inline code, bold, italic and links
 * shown as text. Raw HTML is never interpreted; everything becomes React text.
 */
import type { ReactNode } from 'react'
import css from './ReaderPage.module.css'

const INLINE = /(`[^`\n]+`|\*\*[^*\n]+\*\*|__[^_\n]+__|\*[^*\s][^*\n]*\*|\[[^\]\n]+\]\([^)\s]+\))/g

function inline(text: string, keyPrefix: string): ReactNode[] {
  return text.split(INLINE).map((part, index) => {
    const key = `${keyPrefix}-${index}`
    if (index % 2 === 0) return part
    if (part.startsWith('`')) return <code key={key} className={css.mdCode}>{part.slice(1, -1)}</code>
    if (part.startsWith('**') || part.startsWith('__')) return <strong key={key}>{inline(part.slice(2, -2), key)}</strong>
    if (part.startsWith('*')) return <em key={key}>{inline(part.slice(1, -1), key)}</em>
    // A link keeps its label; the address is not made clickable inside a model reply.
    return <span key={key} className={css.mdLink} title={part.slice(part.indexOf('](') + 2, -1)}>{part.slice(1, part.indexOf(']('))}</span>
  })
}

const BULLET = /^\s*[-*+]\s+(.*)$/
const NUMBER = /^\s*\d+[.)]\s+(.*)$/
const HEADING = /^#{1,6}\s+(.*)$/
const FENCE = /^\s*(```|~~~)/

/**
 * Render Markdown text as React elements.
 * @param props - `text` is the Markdown source.
 * @returns block elements in source order.
 */
export function Markdown({ text }: { readonly text: string }) {
  const out: ReactNode[] = []
  const lines = text.replace(/\r\n?/g, '\n').split('\n')
  let para: string[] = []
  let list: { ordered: boolean; items: string[] } | undefined
  const flush = (): void => {
    const key = out.length
    if (para.length > 0) out.push(<p key={key} className={css.mdP}>{inline(para.join(' '), `p${key}`)}</p>)
    if (list !== undefined) {
      const Tag = list.ordered ? 'ol' : 'ul'
      out.push(<Tag key={key} className={css.mdList}>{list.items.map((item, index) => <li key={index}>{inline(item, `l${key}-${index}`)}</li>)}</Tag>)
    }
    para = []
    list = undefined
  }
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index] ?? ''
    if (FENCE.test(line)) {
      flush()
      const code: string[] = []
      index += 1
      while (index < lines.length && !FENCE.test(lines[index] ?? '')) {
        code.push(lines[index] ?? '')
        index += 1
      }
      out.push(<pre key={out.length} className={css.mdPre}>{code.join('\n')}</pre>)
      continue
    }
    const heading = HEADING.exec(line)
    const bullet = BULLET.exec(line)
    const number = NUMBER.exec(line)
    if (heading !== null) {
      flush()
      out.push(<p key={out.length} className={css.mdHeading}>{inline(heading[1] ?? '', `h${out.length}`)}</p>)
    } else if (bullet !== null || number !== null) {
      const ordered = bullet === null
      if (para.length > 0 || (list !== undefined && list.ordered !== ordered)) flush()
      list ??= { ordered, items: [] }
      list.items.push((bullet ?? number)?.[1] ?? '')
    } else if (line.trim() === '') flush()
    else if (list !== undefined) {
      // An indented line under a list item continues that item.
      const last = list.items.length - 1
      list.items[last] = `${list.items[last] ?? ''} ${line.trim()}`
    } else para.push(line.trim())
  }
  flush()
  return <>{out}</>
}
