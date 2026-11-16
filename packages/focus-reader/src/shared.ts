/** Wire types and route names shared by the Host routes and the browser page. */

/** Host route path listing the documents in the library folder. */
export const READER_DOCS_PATH = '/focus-reader/docs'
/** Document-relative form of the list route, so deployment prefixes keep working. */
export const READER_DOCS_ROUTE = 'focus-reader/docs'
/** Host route path returning one document's blocks and saved notes. */
export const READER_DOC_PATH = '/focus-reader/doc'
/** Document-relative form of the document route. */
export const READER_DOC_ROUTE = 'focus-reader/doc'
/** Host route path replacing one document's saved notes. */
export const READER_NOTES_PATH = '/focus-reader/notes'
/** Document-relative form of the notes route. */
export const READER_NOTES_ROUTE = 'focus-reader/notes'
/** Host route path answering one AI session message. */
export const READER_ASK_PATH = '/focus-reader/ask'
/** Document-relative form of the ask route. */
export const READER_ASK_ROUTE = 'focus-reader/ask'
/** Host route path importing a paper from a link into the library folder. */
export const READER_ADD_PATH = '/focus-reader/add'
/** Document-relative form of the import route. */
export const READER_ADD_ROUTE = 'focus-reader/add'
/** Host route path returning one picture of the library folder. */
export const READER_PICTURE_PATH = '/focus-reader/picture'
/** Document-relative form of the picture route. */
export const READER_PICTURE_ROUTE = 'focus-reader/picture'

/** One file of the library folder. */
export interface ReaderDocEntry {
  /** Path relative to the library folder, with `/` separators. */
  readonly name: string
  readonly bytes: number
  /** ISO 8601 modification time. */
  readonly modified: string
}

/** One block of a parsed document. Paragraph and code blocks are numbered together, headings are not. */
export type ReaderBlock =
  | { readonly kind: 'heading'; readonly level: number; readonly text: string }
  | { readonly kind: 'para'; readonly text: string }
  | { readonly kind: 'code'; readonly text: string }

/** A character range inside one numbered block. `text` is the range's content when it was made. */
export interface ReaderAnchor {
  readonly id: string
  /** Index among the document's numbered (non-heading) blocks. */
  readonly p: number
  readonly start: number
  readonly end: number
  readonly text: string
}

/** One message of an AI session. */
export interface ReaderMessage {
  readonly role: 'me' | 'ai'
  readonly text: string
}

/** A box of messages anchored to a passage: a discussion with the model, or the reader's own comments. */
export interface ReaderSession extends ReaderAnchor {
  /** `ai` is a discussion with the model. `comment` holds only the reader's messages and is never sent to the model. */
  readonly kind: 'ai' | 'comment'
  /** Display number, stable for the life of the session. */
  readonly n: number
  readonly msgs: readonly ReaderMessage[]
  /** Ids of linked sessions; links are stored on both ends. */
  readonly links: readonly string[]
  readonly pinned: boolean
}

/** Everything the reader saves for one document. */
export interface ReaderNotes {
  readonly highlights: readonly ReaderAnchor[]
  readonly sessions: readonly ReaderSession[]
}

/** Response body of the list route. */
export interface ReaderDocsPayload {
  /** Absolute library folder the Host reads from. */
  readonly libraryDir: string
  readonly docs: readonly ReaderDocEntry[]
}

/** Response body of the document route. */
export interface ReaderDocPayload {
  readonly name: string
  readonly blocks: readonly ReaderBlock[]
  readonly notes: ReaderNotes
}

/** Request body of the ask route. The last message is the new question. */
export interface ReaderAskRequest {
  readonly name: string
  readonly p: number
  readonly passage: string
  readonly msgs: readonly ReaderMessage[]
}

/** Response body of the ask route. */
export interface ReaderAskPayload {
  readonly text: string
  /** Model that answered, as `provider/model`. */
  readonly model: string
}

/** Request body of the import route. */
export interface ReaderAddRequest {
  /** What the reader pasted: an arXiv address or identifier. */
  readonly url: string
  /** True to fetch a paper again that is already in the library; its document keeps its name and notes file. */
  readonly refresh?: boolean
}

/** Response body of the import route. */
export interface ReaderAddPayload {
  /** Name of the paper's document, relative to the library folder. */
  readonly name: string
  /** True when the paper was already in the library and nothing was fetched. */
  readonly existing: boolean
  /** Pictures saved next to the document by this request. */
  readonly pictures: number
  /** Pictures of the paper that could not be downloaded. */
  readonly missingPictures: number
}
