# dsh-focus-reader

A DSH Web page for reading Markdown and plain-text files. It adds a **Reader** entry to the left sidebar.

- **Scroll-following focus.** The paragraph at the reading line is fully bright and the rest fade with distance. A checkbox turns this off.
- **Highlight.** Select text inside one paragraph and choose Highlight. Click a highlight to remove it.
- **AI sessions.** Select text and choose Open AI session. The session opens beside the passage and can be continued at any time. Replies render Markdown.
- **Scrolling.** A session follows its passage, holds at the top once it gets there, and folds into a one-line chip when the next open session arrives. Click the chip to return to its passage.
- **Pin.** Opening a session closes every other session unless it is pinned.
- **Link.** Two sessions can be linked; a linked session opens next to the one you came from.
- On a narrow page, sessions unfold under their paragraph.
- **Still water.** In a dark theme the page is an even night-blue and the text sits on it without a card.

## Install

```sh
dsh plugin --profile web add /absolute/path/to/research-os/packages/focus-reader
```

## Configuration

Override the row in the profile's `cordis.patch.yml` (a patch replaces the row's whole `config`):

```yaml
- id: focus-reader
  config:
    libraryDir: /absolute/path/to/your/reading/folder
```

| Field | Default | Meaning |
|---|---|---|
| `libraryDir` | `~/Documents/reading` (set by the bundle patch) | Folder whose `.md`, `.markdown` and `.txt` files can be read, including subfolders |
| `maxDocBytes` | `2097152` | Largest document the reader opens |
| `maxDocs` | `500` | Most documents one listing returns |
| `contextBlocks` | `2` | Paragraphs on each side of the passage that are sent to the model |
| `maxReplyTokens` | `1200` | Longest reply |
| `askTimeoutMs` | `120000` | Longest wait for one reply |
| `systemPrompt` | reading-partner instructions | Instructions sent before the passage |

## Where things are stored

Documents are only read. Highlights, sessions, links and pins for `papers/a.md` are saved in `<libraryDir>/.focus-reader/papers/a.md.json`. Notes are anchored by paragraph number, character offsets and the selected text; if the file is edited, a note is found again by its text, and a note whose text is gone stays in the notes file but is not shown.

## Model use

Each message makes one request to the composition's default model (`agentDefaultModel`), with the credentials already configured in DSH. The request carries the system prompt, the document name, the passage, up to `contextBlocks` paragraphs on each side, and the session's earlier messages. The call runs outside any DSH Session: it is not written to a Session log and does not share a prompt cache with one. The whole document is never sent.

## Known limitations

- PDF and web pages are not supported; convert them to Markdown first.
- Inline Markdown (links, emphasis, tables, lists) is shown as written, not rendered.
- A selection must stay inside one paragraph and cannot overlap an existing highlight or session.
- Replies are not streamed, and only one session can be waiting for a reply at a time.
- Tests cover document parsing and notes storage. The routes and the page were checked by hand in a running DSH.
- English and Simplified Chinese copy only.
