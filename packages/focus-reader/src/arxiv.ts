/**
 * arXiv import: recognise a paper link and convert arXiv's web-page version of
 * the paper (LaTeXML output) into the Markdown the reader parses.
 *
 * The conversion keeps headings, paragraphs, list items, display equations,
 * tables, figure captions, the text of boxed examples, and the reference list.
 * A formula becomes its LaTeX source between `$` signs. A table becomes a
 * Markdown pipe table. A figure's picture file becomes an image line naming a
 * file the caller downloads; a picture drawn inside the page itself is not
 * kept, only its text.
 */

/** arXiv identifier of the form `2610.11291`, with an optional version. */
const ID = /(\d{4}\.\d{4,5})(v\d+)?/
const HOSTS = new Set(['arxiv.org', 'www.arxiv.org', 'export.arxiv.org'])

/** One recognised paper. */
export interface ArxivPaper {
  /** Identifier without a version, such as `2610.11291`. */
  readonly id: string
  /** Address of the paper's web-page version, with the version the link named. */
  readonly htmlUrl: string
  /** Address of the paper's abstract page. */
  readonly absUrl: string
}

/**
 * Recognise an arXiv paper in what the reader pasted.
 * @param link - an `arxiv.org` address (`/abs/`, `/pdf/` or `/html/`), `arXiv:2610.11291`, or a bare identifier.
 * @returns the paper, or `undefined` when the text names no arXiv paper with a 2007-or-later identifier.
 */
export function arxivPaper(link: string): ArxivPaper | undefined {
  const text = link.trim()
  let rest: string
  if (/^https?:\/\//i.test(text)) {
    if (!URL.canParse(text)) return undefined
    const url = new URL(text)
    if (!HOSTS.has(url.hostname.toLowerCase())) return undefined
    const path = /^\/(?:abs|pdf|html)\/(.+)$/.exec(url.pathname)
    if (path === null) return undefined
    rest = (path[1] ?? '').replace(/\.pdf$/i, '')
  } else rest = text.replace(/^arxiv:\s*/i, '')
  const match = new RegExp(`^${ID.source}$`).exec(rest)
  if (match === null) return undefined
  const id = match[1] ?? ''
  return { id, htmlUrl: `https://arxiv.org/html/${id}${match[2] ?? ''}`, absUrl: `https://arxiv.org/abs/${id}` }
}

/**
 * File name for an imported paper.
 * @param id - arXiv identifier without a version.
 * @param title - paper title; characters that are unsafe in file names are removed.
 * @returns `<id> <title>.md`, or `<id>.md` when the title has no usable characters.
 */
export function paperFileName(id: string, title: string): string {
  const safe = title.replace(/\$[^$]*\$/g, ' ').replace(/[^\p{L}\p{N} ,()'&+-]/gu, ' ').replace(/\s+/g, ' ').trim().slice(0, 80).trim()
  return safe === '' ? `${id}.md` : `${id} ${safe}.md`
}

interface El {
  readonly tag: string
  readonly attrs: Readonly<Record<string, string>>
  readonly kids: (El | string)[]
  readonly parent: El | undefined
}

const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr'])
const RAW = new Set(['script', 'style'])
const NAMED: Readonly<Record<string, string>> = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: '\'', nbsp: ' ', ndash: '–', mdash: '—', hellip: '…',
  lsquo: '‘', rsquo: '’', ldquo: '“', rdquo: '”', times: '×', minus: '−',
}

function decode(text: string): string {
  return text.replace(/&(?:#(\d+)|#x([0-9a-f]+)|([a-z]+));/gi, (whole, dec: string | undefined, hex: string | undefined, named: string | undefined) => {
    if (named !== undefined) return NAMED[named.toLowerCase()] ?? whole
    const code = dec !== undefined ? Number.parseInt(dec, 10) : Number.parseInt(hex ?? '', 16)
    return code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : whole
  })
}

/** Build an element tree from machine-written HTML. End tags close the nearest open element of that name. */
function parseHtml(html: string): El {
  const root: El = { tag: '#root', attrs: {}, kids: [], parent: undefined }
  let current = root
  const token = /<!--[\s\S]*?-->|<![^>]*>|<\/([a-zA-Z][^\s>]*)[^>]*>|<([a-zA-Z][^\s/>]*)((?:"[^"]*"|'[^']*'|[^>"'])*)>|[^<]+|</g
  for (let match = token.exec(html); match !== null; match = token.exec(html)) {
    const [whole, endTag, startTag, attrText] = match
    if (endTag !== undefined) {
      const name = endTag.toLowerCase()
      let open: El | undefined = current
      while (open !== undefined && open.tag !== name) open = open.parent
      if (open?.parent !== undefined) current = open.parent
    } else if (startTag !== undefined) {
      const tag = startTag.toLowerCase()
      const attrs: Record<string, string> = {}
      for (const attr of (attrText ?? '').matchAll(/([^\s=/]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)) {
        attrs[(attr[1] ?? '').toLowerCase()] = decode(attr[2] ?? attr[3] ?? attr[4] ?? '')
      }
      const el: El = { tag, attrs, kids: [], parent: current }
      current.kids.push(el)
      if (RAW.has(tag)) {
        const close = html.toLowerCase().indexOf(`</${tag}`, token.lastIndex)
        token.lastIndex = close < 0 ? html.length : close
        current = el
      } else if (!VOID.has(tag) && !(attrText ?? '').trimEnd().endsWith('/')) current = el
    } else if (!whole.startsWith('<!')) current.kids.push(decode(whole))
  }
  return root
}

const classes = (el: El): readonly string[] => (el.attrs.class ?? '').split(/\s+/)
const has = (el: El, ...names: string[]): boolean => classes(el).some(name => names.includes(name))
const clean = (text: string): string => text.replace(/\s+/g, ' ').trim()

function find(node: El | string, test: (el: El) => boolean, out: El[] = []): El[] {
  if (typeof node === 'string') return out
  if (test(node)) out.push(node)
  else for (const kid of node.kids) find(kid, test, out)
  return out
}

const SILENT = new Set(['script', 'style', 'svg', 'button', 'annotation', 'annotation-xml', 'object', 'img'])

/**
 * Text of a node with each formula written as `$latex$`; footnotes are left out.
 * @param node - element or text.
 * @param bold - when true, bold spans are wrapped in `**`.
 * @returns the text, with the page's own spacing.
 */
function inline(node: El | string, bold = false): string {
  if (typeof node === 'string') return node
  if (node.tag === 'math') {
    const tex = clean(node.attrs.alttext ?? '')
    return tex === '' ? '' : `$${tex}$`
  }
  if (SILENT.has(node.tag) || has(node, 'ltx_note', 'ltx_tag_note')) return ''
  if (node.tag === 'br') return ' '
  const text = node.kids.map(kid => inline(kid, bold)).join('')
  if (!bold || !has(node, 'ltx_font_bold') || text.includes('*') || text.includes('$')) return text
  const core = text.trim()
  return core === '' ? text : text.replace(core, `**${core}**`)
}

/** A formula between `$` signs, as {@link inline} writes it. */
const MATH = /\$[^$]+\$/g

/** Cell text for a pipe table: a `|` outside a formula is escaped, and one inside is written as a TeX command. */
function cell(node: El): string {
  const text = clean(inline(node, true))
  const maths = text.match(MATH) ?? []
  return text.split(MATH).map((plain, index) => {
    const math = (maths[index] ?? '').replace(/\\\|/g, '\\Vert ').replace(/\|/g, '\\vert ')
    return plain.replace(/\|/g, '\\|') + math
  }).join('')
}

/**
 * Write a LaTeXML table as a Markdown pipe table. A cell spanning columns is followed by empty cells.
 * @param table - the element carrying `ltx_tabular`.
 * @returns the table's lines, or `undefined` when no cell holds text.
 */
function pipeTable(table: El): string | undefined {
  const rows = find(table, el => has(el, 'ltx_tr')).map((row) => {
    const cells: string[] = []
    for (const kid of row.kids) {
      if (typeof kid === 'string' || !has(kid, 'ltx_td', 'ltx_th')) continue
      cells.push(cell(kid))
      const span = Math.min(Number.parseInt(kid.attrs.colspan ?? '1', 10) || 1, 50)
      for (let extra = 1; extra < span; extra++) cells.push('')
    }
    return cells
  }).filter(cells => cells.some(text => text !== ''))
  const width = Math.max(0, ...rows.map(cells => cells.length))
  const [head, ...body] = rows
  if (head === undefined || width === 0) return undefined
  const line = (cells: readonly string[]): string => `| ${Array.from({ length: width }, (_, index) => cells[index] ?? '').join(' | ')} |`
  return [line(head), `|${' --- |'.repeat(width)}`, ...body.map(line)].join('\n')
}

/** File types an imported picture may have. */
const PICTURE = /\.(?:png|jpe?g|gif|webp|svg)$/i

const LEVELS: readonly (readonly [string, number])[] = [
  ['ltx_title_document', 1], ['ltx_title_section', 2], ['ltx_title_abstract', 2], ['ltx_title_bibliography', 2],
  ['ltx_title_appendix', 2], ['ltx_title_acknowledgements', 2], ['ltx_title_subsection', 3],
  ['ltx_title_subsubsection', 4], ['ltx_title_paragraph', 5],
]
const SKIPPED_TAGS = new Set(['nav', 'script', 'style', 'head', 'header', 'footer', 'button'])
const SKIPPED_CLASSES = ['ltx_page_footer', 'ltx_page_header', 'ltx_TOC', 'ltx_pagination', 'ltx_dates', 'ltx_page_logo', 'ltx_role_affiliationtext']

/** One picture file a converted paper refers to. */
export interface ArxivPicture {
  /** Address of the file on arxiv.org. */
  readonly url: string
  /** File name inside the paper's picture folder. */
  readonly file: string
  /** The Markdown block that shows the picture, exactly as written. */
  readonly line: string
}

/** A converted paper. */
export interface ArxivMarkdown {
  /** Paper title, empty when the page had none. */
  readonly title: string
  /** Markdown blocks in document order; the file is these joined by one blank line. */
  readonly blocks: readonly string[]
  /** Number of paragraphs, list items, equations, tables, pictures, captions and references among the blocks. */
  readonly paragraphs: number
  /** Picture files the blocks refer to, each once. */
  readonly pictures: readonly ArxivPicture[]
}

/** Where a converted paper comes from and where its pictures go. */
export interface ArxivSource {
  /** Address written under the title as the paper's source. */
  readonly sourceUrl: string
  /** Address the HTML was downloaded from; picture addresses are resolved against it. */
  readonly pageUrl: string
  /** Folder of the paper's pictures, relative to the Markdown file, with `/` separators and no spaces. */
  readonly pictureFolder: string
}

/**
 * Convert arXiv's web-page version of a paper to Markdown.
 * @param html - the page's HTML.
 * @param source - the paper's addresses and its picture folder.
 * @returns the title, the Markdown blocks, how many of them are text, and the pictures to download.
 */
export function arxivToMarkdown(html: string, source: ArxivSource): ArxivMarkdown {
  const root = parseHtml(html)
  const blocks: string[] = []
  const pictures = new Map<string, ArxivPicture>()
  let title = ''
  let paragraphs = 0
  let captionNote = ''
  const emit = (text: string, heading = false): void => {
    const line = clean(text)
    if (line === '') return
    blocks.push(line)
    if (!heading) paragraphs += 1
  }
  const picture = (address: string): void => {
    if (!URL.canParse(address, source.pageUrl)) return
    const url = new URL(address, source.pageUrl)
    if (!HOSTS.has(url.hostname.toLowerCase()) || !url.pathname.startsWith('/html/') || !PICTURE.test(url.pathname)) return
    let known = pictures.get(url.href)
    if (known === undefined) {
      const base = (url.pathname.split('/').at(-1) ?? '').replace(/[^A-Za-z0-9._-]/g, '_').replace(/^\.+/, '')
      const taken = new Set([...pictures.values()].map(item => item.file))
      const file = taken.has(base) ? `${pictures.size + 1}-${base}` : base
      known = { url: url.href, file, line: `![Figure](${source.pictureFolder}/${file})` }
      pictures.set(url.href, known)
    }
    blocks.push(known.line)
    paragraphs += 1
  }
  const walk = (node: El | string, bullet: { mark: string } | undefined): void => {
    if (typeof node === 'string' || SKIPPED_TAGS.has(node.tag) || has(node, ...SKIPPED_CLASSES)) return
    if (node.tag === 'figure') {
      // A figure none of whose content can be kept says so in front of its caption.
      const kept = find(node, el => has(el, 'ltx_graphics', 'ltx_tabular', 'ltx_picture', 'ltx_p')).length > 0
      const outer = captionNote
      if (!kept) captionNote = `[${has(node, 'ltx_table') ? 'Table' : 'Figure'} — see the original] `
      for (const kid of node.kids) walk(kid, undefined)
      captionNote = outer
      return
    }
    if (node.tag === 'figcaption') {
      emit(captionNote + inline(node))
      return
    }
    if (has(node, 'ltx_graphics')) {
      const address = node.tag === 'object' ? node.attrs.data : node.attrs.src
      if (address !== undefined && address !== '') picture(address)
      return
    }
    if (has(node, 'ltx_tabular')) {
      const table = pipeTable(node)
      if (table !== undefined) {
        blocks.push(table)
        paragraphs += 1
      }
      return
    }
    if (node.tag === 'svg') {
      // A picture drawn in the page keeps only the text it frames, such as a boxed example.
      for (const frame of find(node, el => el.tag === 'foreignobject')) {
        const before = blocks.length
        for (const kid of frame.kids) walk(kid, undefined)
        if (blocks.length === before) emit(inline(frame))
      }
      return
    }
    if (/^h[1-6]$/.test(node.tag) && has(node, 'ltx_title')) {
      const level = LEVELS.find(([name]) => has(node, name))?.[1]
      const text = clean(inline(node))
      // Titles of theorems and similar boxes read as a line of text, not as a section.
      if (level === undefined) emit(text)
      else if (level === 1 && title === '') {
        title = text
        emit(`# ${text}`, true)
        emit(`Source: ${source.sourceUrl}`)
      } else emit(`${'#'.repeat(level)} ${text}`, true)
      return
    }
    if (has(node, 'ltx_authors')) {
      emit(find(node, el => has(el, 'ltx_personname')).map(el => clean(inline(el))).filter(name => name !== '').join(', '))
      return
    }
    if (node.tag === 'table' && has(node, 'ltx_equation', 'ltx_equationgroup', 'ltx_eqn_table')) {
      const tex = find(node, el => el.tag === 'math').map(el => clean(el.attrs.alttext ?? '')).filter(part => part !== '').join(' \\\\ ')
      if (tex !== '') emit(`$$ ${tex} $$`)
      return
    }
    if (has(node, 'ltx_bibitem')) {
      emit(inline(node))
      return
    }
    if (node.tag === 'p') {
      const text = clean(inline(node))
      if (text === '') return
      emit((bullet?.mark ?? '') + text)
      if (bullet !== undefined) bullet.mark = ''
      return
    }
    const next = node.tag === 'li' ? { mark: '- ' } : bullet
    for (const kid of node.kids) walk(kid, next)
  }
  walk(find(root, el => el.tag === 'article')[0] ?? root, undefined)
  return { title, blocks, paragraphs, pictures: [...pictures.values()] }
}
