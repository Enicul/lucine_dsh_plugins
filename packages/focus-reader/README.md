# dsh-focus-reader

A DSH Web page for reading Markdown and plain-text files. It adds a **Reader** entry to the left sidebar.

- **Add a paper by link.** Paste an arXiv address or identifier into the box in the document bar. The paper is saved in the library folder as Markdown, with its pictures, and opens. A paper that is already there is opened as it is, with a button to fetch it again.
- **Scroll-following focus.** The paragraph at the reading line is fully bright and the rest fade with distance. A checkbox turns this off.
- **Formulas, tables and pictures.** A formula between dollar signs is drawn, a Markdown pipe table is shown as a table, and a block that is one image line (`![alt](folder/file.png)`) shows that picture from the library folder.
- **Highlight.** Select text inside one paragraph and choose Highlight. Click a highlight to remove it.
- **Comments.** Select text and choose Comment. The passage is marked in green and your notes on it are kept in a box beside it. A comment is never sent to the model. Delete asks once more before it removes the comment.
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
| `importFolder` | `papers` | Folder inside the library where imported papers are saved |
| `maxImportBytes` | `16777216` | Largest web page an import downloads |
| `importTimeoutMs` | `30000` | Longest an import waits for one file from arxiv.org |
| `maxImportPictures` | `80` | Most pictures one import downloads |
| `maxPictureBytes` | `8388608` | Largest picture an import downloads or the reader shows |

## Where things are stored

Documents are only read, except that fetching a paper again replaces its file. Highlights, comments, sessions, links and pins for `papers/a.md` are saved in `<libraryDir>/.focus-reader/papers/a.md.json`. Notes are anchored by paragraph number, character offsets and the selected text; if the file is edited, a note is found again by its text, and a note whose text is gone stays in the notes file but is not shown.

## Importing from arXiv

The Host recognises `arxiv.org/abs/…`, `/pdf/…` and `/html/…` addresses, `arXiv:2610.11291`, and a bare identifier of that form. It downloads the paper's web-page version from `https://arxiv.org/html/<id>` and the picture files that page shows from under `arxiv.org/html/`, and nothing else: no other site is ever fetched, and the pasted text is never used as an address. The page is converted to headings, paragraphs, list items, display equations, tables and the reference list, then saved as `<importFolder>/<id> <title>.md`. Pictures are saved in `<importFolder>/<id>/`.

- A formula is written as its LaTeX source between `$` signs.
- A table becomes a Markdown pipe table. A cell that spans columns is followed by empty cells; cells that span rows are not aligned.
- A figure's picture file (`.png`, `.jpg`, `.gif`, `.webp`, `.svg`) becomes an image line followed by its caption. A picture that fails to download leaves a line of text in its place.
- A picture drawn inside the page itself keeps only the text it frames, such as a boxed example. A figure with nothing that can be kept has its caption marked "see the original".
- Fetching a paper again keeps the file name and the notes file. A note is found again by its text.
- Footnotes are left out.
- A paper that arXiv offers only as a PDF is refused with a message.
- The download uses the Host process's network settings. Behind a proxy, start DSH with `HTTPS_PROXY` and `NODE_USE_ENV_PROXY=1` set.

## Model use

Each message makes one request to the composition's default model (`agentDefaultModel`), with the credentials already configured in DSH. The request carries the system prompt, the document name, the passage, up to `contextBlocks` paragraphs on each side, and the session's earlier messages. The call runs outside any DSH Session: it is not written to a Session log and does not share a prompt cache with one. The whole document is never sent.

## Known limitations

- Only arXiv papers that have a web-page version can be added by link. PDFs and other web pages are not supported; convert them to Markdown first.
- A formula that the renderer cannot parse is shown as its source in red.
- Other inline Markdown in a document (links, emphasis, lists) is shown as written, not rendered.
- Pictures and tables cannot be highlighted or commented on. Formulas inside a model's reply are not drawn.
- A selection must stay inside one paragraph and cannot overlap an existing highlight, comment or session. A selection that touches a formula takes the whole formula.
- Replies are not streamed, and only one session can be waiting for a reply at a time.
- Tests cover document parsing, notes storage, link recognition and the arXiv conversion. The routes and the page were checked by hand in a running DSH.
- English and Simplified Chinese copy only.
