import Schema from "@deepseek-ai/schemastery";
import { BlockAssembler } from "@deepseek-ai/dsh-llm";
import { mkdir, readFile, readdir, rename, stat, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, extname, join, resolve, sep } from "node:path";
//#region lib/types/arxiv.js
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
const ID = /(\d{4}\.\d{4,5})(v\d+)?/;
const HOSTS = new Set([
	"arxiv.org",
	"www.arxiv.org",
	"export.arxiv.org"
]);
/**
* Recognise an arXiv paper in what the reader pasted.
* @param link - an `arxiv.org` address (`/abs/`, `/pdf/` or `/html/`), `arXiv:2610.11291`, or a bare identifier.
* @returns the paper, or `undefined` when the text names no arXiv paper with a 2007-or-later identifier.
*/
function arxivPaper(link) {
	const text = link.trim();
	let rest;
	if (/^https?:\/\//i.test(text)) {
		if (!URL.canParse(text)) return void 0;
		const url = new URL(text);
		if (!HOSTS.has(url.hostname.toLowerCase())) return void 0;
		const path = /^\/(?:abs|pdf|html)\/(.+)$/.exec(url.pathname);
		if (path === null) return void 0;
		rest = (path[1] ?? "").replace(/\.pdf$/i, "");
	} else rest = text.replace(/^arxiv:\s*/i, "");
	const match = new RegExp(`^${ID.source}$`).exec(rest);
	if (match === null) return void 0;
	const id = match[1] ?? "";
	return {
		id,
		htmlUrl: `https://arxiv.org/html/${id}${match[2] ?? ""}`,
		absUrl: `https://arxiv.org/abs/${id}`
	};
}
/**
* File name for an imported paper.
* @param id - arXiv identifier without a version.
* @param title - paper title; characters that are unsafe in file names are removed.
* @returns `<id> <title>.md`, or `<id>.md` when the title has no usable characters.
*/
function paperFileName(id, title) {
	const safe = title.replace(/\$[^$]*\$/g, " ").replace(/[^\p{L}\p{N} ,()'&+-]/gu, " ").replace(/\s+/g, " ").trim().slice(0, 80).trim();
	return safe === "" ? `${id}.md` : `${id} ${safe}.md`;
}
const VOID = new Set([
	"area",
	"base",
	"br",
	"col",
	"embed",
	"hr",
	"img",
	"input",
	"link",
	"meta",
	"source",
	"track",
	"wbr"
]);
const RAW = new Set(["script", "style"]);
const NAMED = {
	amp: "&",
	lt: "<",
	gt: ">",
	quot: "\"",
	apos: "'",
	nbsp: " ",
	ndash: "–",
	mdash: "—",
	hellip: "…",
	lsquo: "‘",
	rsquo: "’",
	ldquo: "“",
	rdquo: "”",
	times: "×",
	minus: "−"
};
function decode(text) {
	return text.replace(/&(?:#(\d+)|#x([0-9a-f]+)|([a-z]+));/gi, (whole, dec, hex, named) => {
		if (named !== void 0) return NAMED[named.toLowerCase()] ?? whole;
		const code = dec !== void 0 ? Number.parseInt(dec, 10) : Number.parseInt(hex ?? "", 16);
		return code > 0 && code <= 1114111 ? String.fromCodePoint(code) : whole;
	});
}
/** Build an element tree from machine-written HTML. End tags close the nearest open element of that name. */
function parseHtml(html) {
	const root = {
		tag: "#root",
		attrs: {},
		kids: [],
		parent: void 0
	};
	let current = root;
	const token = /<!--[\s\S]*?-->|<![^>]*>|<\/([a-zA-Z][^\s>]*)[^>]*>|<([a-zA-Z][^\s/>]*)((?:"[^"]*"|'[^']*'|[^>"'])*)>|[^<]+|</g;
	for (let match = token.exec(html); match !== null; match = token.exec(html)) {
		const [whole, endTag, startTag, attrText] = match;
		if (endTag !== void 0) {
			const name = endTag.toLowerCase();
			let open = current;
			while (open !== void 0 && open.tag !== name) open = open.parent;
			if (open?.parent !== void 0) current = open.parent;
		} else if (startTag !== void 0) {
			const tag = startTag.toLowerCase();
			const attrs = {};
			for (const attr of (attrText ?? "").matchAll(/([^\s=/]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)) attrs[(attr[1] ?? "").toLowerCase()] = decode(attr[2] ?? attr[3] ?? attr[4] ?? "");
			const el = {
				tag,
				attrs,
				kids: [],
				parent: current
			};
			current.kids.push(el);
			if (RAW.has(tag)) {
				const close = html.toLowerCase().indexOf(`</${tag}`, token.lastIndex);
				token.lastIndex = close < 0 ? html.length : close;
				current = el;
			} else if (!VOID.has(tag) && !(attrText ?? "").trimEnd().endsWith("/")) current = el;
		} else if (!whole.startsWith("<!")) current.kids.push(decode(whole));
	}
	return root;
}
const classes = (el) => (el.attrs.class ?? "").split(/\s+/);
const has = (el, ...names) => classes(el).some((name) => names.includes(name));
const clean = (text) => text.replace(/\s+/g, " ").trim();
function find(node, test, out = []) {
	if (typeof node === "string") return out;
	if (test(node)) out.push(node);
	else for (const kid of node.kids) find(kid, test, out);
	return out;
}
const SILENT = new Set([
	"script",
	"style",
	"svg",
	"button",
	"annotation",
	"annotation-xml",
	"object",
	"img"
]);
/**
* Text of a node with each formula written as `$latex$`; footnotes are left out.
* @param node - element or text.
* @param bold - when true, bold spans are wrapped in `**`.
* @returns the text, with the page's own spacing.
*/
function inline(node, bold = false) {
	if (typeof node === "string") return node;
	if (node.tag === "math") {
		const tex = clean(node.attrs.alttext ?? "");
		return tex === "" ? "" : `$${tex}$`;
	}
	if (SILENT.has(node.tag) || has(node, "ltx_note", "ltx_tag_note")) return "";
	if (node.tag === "br") return " ";
	const text = node.kids.map((kid) => inline(kid, bold)).join("");
	if (!bold || !has(node, "ltx_font_bold") || text.includes("*") || text.includes("$")) return text;
	const core = text.trim();
	return core === "" ? text : text.replace(core, `**${core}**`);
}
/** A formula between `$` signs, as {@link inline} writes it. */
const MATH = /\$[^$]+\$/g;
/** Cell text for a pipe table: a `|` outside a formula is escaped, and one inside is written as a TeX command. */
function cell(node) {
	const text = clean(inline(node, true));
	const maths = text.match(MATH) ?? [];
	return text.split(MATH).map((plain, index) => {
		const math = (maths[index] ?? "").replace(/\\\|/g, "\\Vert ").replace(/\|/g, "\\vert ");
		return plain.replace(/\|/g, "\\|") + math;
	}).join("");
}
/**
* Write a LaTeXML table as a Markdown pipe table. A cell spanning columns is followed by empty cells.
* @param table - the element carrying `ltx_tabular`.
* @returns the table's lines, or `undefined` when no cell holds text.
*/
function pipeTable(table) {
	const rows = find(table, (el) => has(el, "ltx_tr")).map((row) => {
		const cells = [];
		for (const kid of row.kids) {
			if (typeof kid === "string" || !has(kid, "ltx_td", "ltx_th")) continue;
			cells.push(cell(kid));
			const span = Math.min(Number.parseInt(kid.attrs.colspan ?? "1", 10) || 1, 50);
			for (let extra = 1; extra < span; extra++) cells.push("");
		}
		return cells;
	}).filter((cells) => cells.some((text) => text !== ""));
	const width = Math.max(0, ...rows.map((cells) => cells.length));
	const [head, ...body] = rows;
	if (head === void 0 || width === 0) return void 0;
	const line = (cells) => `| ${Array.from({ length: width }, (_, index) => cells[index] ?? "").join(" | ")} |`;
	return [
		line(head),
		`|${" --- |".repeat(width)}`,
		...body.map(line)
	].join("\n");
}
/** File types an imported picture may have. */
const PICTURE = /\.(?:png|jpe?g|gif|webp|svg)$/i;
const LEVELS = [
	["ltx_title_document", 1],
	["ltx_title_section", 2],
	["ltx_title_abstract", 2],
	["ltx_title_bibliography", 2],
	["ltx_title_appendix", 2],
	["ltx_title_acknowledgements", 2],
	["ltx_title_subsection", 3],
	["ltx_title_subsubsection", 4],
	["ltx_title_paragraph", 5]
];
const SKIPPED_TAGS = new Set([
	"nav",
	"script",
	"style",
	"head",
	"header",
	"footer",
	"button"
]);
const SKIPPED_CLASSES = [
	"ltx_page_footer",
	"ltx_page_header",
	"ltx_TOC",
	"ltx_pagination",
	"ltx_dates",
	"ltx_page_logo",
	"ltx_role_affiliationtext"
];
/**
* Convert arXiv's web-page version of a paper to Markdown.
* @param html - the page's HTML.
* @param source - the paper's addresses and its picture folder.
* @returns the title, the Markdown blocks, how many of them are text, and the pictures to download.
*/
function arxivToMarkdown(html, source) {
	const root = parseHtml(html);
	const blocks = [];
	const pictures = /* @__PURE__ */ new Map();
	let title = "";
	let paragraphs = 0;
	let captionNote = "";
	const emit = (text, heading = false) => {
		const line = clean(text);
		if (line === "") return;
		blocks.push(line);
		if (!heading) paragraphs += 1;
	};
	const picture = (address) => {
		if (!URL.canParse(address, source.pageUrl)) return;
		const url = new URL(address, source.pageUrl);
		if (!HOSTS.has(url.hostname.toLowerCase()) || !url.pathname.startsWith("/html/") || !PICTURE.test(url.pathname)) return;
		let known = pictures.get(url.href);
		if (known === void 0) {
			const base = (url.pathname.split("/").at(-1) ?? "").replace(/[^A-Za-z0-9._-]/g, "_").replace(/^\.+/, "");
			const file = new Set([...pictures.values()].map((item) => item.file)).has(base) ? `${pictures.size + 1}-${base}` : base;
			known = {
				url: url.href,
				file,
				line: `![Figure](${source.pictureFolder}/${file})`
			};
			pictures.set(url.href, known);
		}
		blocks.push(known.line);
		paragraphs += 1;
	};
	const walk = (node, bullet) => {
		if (typeof node === "string" || SKIPPED_TAGS.has(node.tag) || has(node, ...SKIPPED_CLASSES)) return;
		if (node.tag === "figure") {
			const kept = find(node, (el) => has(el, "ltx_graphics", "ltx_tabular", "ltx_picture", "ltx_p")).length > 0;
			const outer = captionNote;
			if (!kept) captionNote = `[${has(node, "ltx_table") ? "Table" : "Figure"} — see the original] `;
			for (const kid of node.kids) walk(kid, void 0);
			captionNote = outer;
			return;
		}
		if (node.tag === "figcaption") {
			emit(captionNote + inline(node));
			return;
		}
		if (has(node, "ltx_graphics")) {
			const address = node.tag === "object" ? node.attrs.data : node.attrs.src;
			if (address !== void 0 && address !== "") picture(address);
			return;
		}
		if (has(node, "ltx_tabular")) {
			const table = pipeTable(node);
			if (table !== void 0) {
				blocks.push(table);
				paragraphs += 1;
			}
			return;
		}
		if (node.tag === "svg") {
			for (const frame of find(node, (el) => el.tag === "foreignobject")) {
				const before = blocks.length;
				for (const kid of frame.kids) walk(kid, void 0);
				if (blocks.length === before) emit(inline(frame));
			}
			return;
		}
		if (/^h[1-6]$/.test(node.tag) && has(node, "ltx_title")) {
			const level = LEVELS.find(([name]) => has(node, name))?.[1];
			const text = clean(inline(node));
			if (level === void 0) emit(text);
			else if (level === 1 && title === "") {
				title = text;
				emit(`# ${text}`, true);
				emit(`Source: ${source.sourceUrl}`);
			} else emit(`${"#".repeat(level)} ${text}`, true);
			return;
		}
		if (has(node, "ltx_authors")) {
			emit(find(node, (el) => has(el, "ltx_personname")).map((el) => clean(inline(el))).filter((name) => name !== "").join(", "));
			return;
		}
		if (node.tag === "table" && has(node, "ltx_equation", "ltx_equationgroup", "ltx_eqn_table")) {
			const tex = find(node, (el) => el.tag === "math").map((el) => clean(el.attrs.alttext ?? "")).filter((part) => part !== "").join(" \\\\ ");
			if (tex !== "") emit(`$$ ${tex} $$`);
			return;
		}
		if (has(node, "ltx_bibitem")) {
			emit(inline(node));
			return;
		}
		if (node.tag === "p") {
			const text = clean(inline(node));
			if (text === "") return;
			emit((bullet?.mark ?? "") + text);
			if (bullet !== void 0) bullet.mark = "";
			return;
		}
		const next = node.tag === "li" ? { mark: "- " } : bullet;
		for (const kid of node.kids) walk(kid, next);
	};
	walk(find(root, (el) => el.tag === "article")[0] ?? root, void 0);
	return {
		title,
		blocks,
		paragraphs,
		pictures: [...pictures.values()]
	};
}
//#endregion
//#region lib/types/library.js
/**
* Library folder access: list documents, parse one into blocks, and read or
* replace its saved notes. Documents are opened for reading only; notes live in
* `<libraryDir>/.focus-reader/<document name>.json`.
*/
const NOTES_DIR = ".focus-reader";
const EXTENSIONS = new Set([
	".md",
	".markdown",
	".txt"
]);
const EMPTY = {
	highlights: [],
	sessions: []
};
/** A request that names something outside the library or of the wrong form. */
var LibraryError = class extends Error {
	status;
	/**
	* @param status - HTTP status the route answers with.
	* @param message - text shown to the reader.
	*/
	constructor(status, message) {
		super(message);
		this.status = status;
	}
};
/**
* Expand a leading `~` to the home directory and make the path absolute.
* @param dir - configured folder.
* @returns absolute folder path.
*/
function expandDir(dir) {
	return resolve(dir === "~" || dir.startsWith("~/") ? join(homedir(), dir.slice(1)) : dir);
}
/**
* Resolve a document name inside the library folder.
* @param libraryDir - absolute library folder.
* @param name - path relative to the library, with `/` separators.
* @returns absolute file path.
* @throws {LibraryError} when the name leaves the folder, enters a dot folder, or is not a text document.
*/
function resolveDoc(libraryDir, name) {
	if (!EXTENSIONS.has(extname(name).toLowerCase())) throw new LibraryError(400, "only .md, .markdown and .txt files can be read");
	return resolveInside(libraryDir, name);
}
function resolveInside(libraryDir, name) {
	const parts = name.split("/");
	if (name === "" || parts.some((part) => part === "" || part.startsWith("."))) throw new LibraryError(400, "invalid document name");
	const path = resolve(libraryDir, ...parts);
	if (!path.startsWith(libraryDir + sep)) throw new LibraryError(400, "invalid document name");
	return path;
}
/** Picture file types the library serves, with the media type each is sent as. */
const PICTURE_TYPES = {
	".png": "image/png",
	".jpg": "image/jpeg",
	".jpeg": "image/jpeg",
	".gif": "image/gif",
	".webp": "image/webp",
	".svg": "image/svg+xml"
};
/**
* Resolve a picture name inside the library folder.
* @param libraryDir - absolute library folder.
* @param name - path relative to the library, with `/` separators.
* @returns the absolute file path and the media type of its extension.
* @throws {LibraryError} when the name leaves the folder, enters a dot folder, or is not a picture file.
*/
function resolvePicture(libraryDir, name) {
	const type = PICTURE_TYPES[extname(name).toLowerCase()];
	if (type === void 0) throw new LibraryError(400, "only .png, .jpg, .gif, .webp and .svg pictures can be shown");
	return {
		path: resolveInside(libraryDir, name),
		type
	};
}
/**
* Read one picture of the library.
* @param libraryDir - absolute library folder.
* @param name - picture name relative to the library.
* @param maxBytes - larger files are refused.
* @returns the file's bytes and media type.
* @throws {LibraryError} when the picture is missing, too large, or badly named.
*/
async function readPicture(libraryDir, name, maxBytes) {
	const { path, type } = resolvePicture(libraryDir, name);
	let size;
	try {
		size = (await stat(path)).size;
	} catch (error) {
		throw new LibraryError(404, "no such picture");
	}
	if (size > maxBytes) throw new LibraryError(413, `picture is larger than ${maxBytes} bytes`);
	return {
		bytes: await readFile(path),
		type
	};
}
/**
* Add a picture to the library, writing a temporary file first so an interrupted write leaves no partial picture.
* @param libraryDir - absolute library folder.
* @param name - picture name relative to the library.
* @param bytes - file content.
* @throws {LibraryError} when the name is not a picture name inside the library.
*/
async function savePicture(libraryDir, name, bytes) {
	const { path } = resolvePicture(libraryDir, name);
	await mkdir(dirname(path), { recursive: true });
	const temporary = `${path}.${process.pid}.tmp`;
	await writeFile(temporary, bytes);
	await rename(temporary, path);
}
/**
* List every text document under the library folder, newest first.
* @param libraryDir - absolute library folder; a missing folder lists nothing.
* @param maxDocs - listing stops after this many documents.
* @returns document entries.
*/
async function listDocs(libraryDir, maxDocs) {
	const out = [];
	const walk = async (dir, prefix) => {
		let names;
		try {
			names = await readdir(dir);
		} catch (error) {
			return;
		}
		for (const name of names.sort()) {
			if (out.length >= maxDocs) return;
			if (name.startsWith(".") || name === "node_modules") continue;
			const path = join(dir, name);
			const info = await stat(path);
			if (info.isDirectory()) await walk(path, `${prefix}${name}/`);
			else if (EXTENSIONS.has(extname(name).toLowerCase())) out.push({
				name: prefix + name,
				bytes: info.size,
				modified: info.mtime.toISOString()
			});
		}
	};
	await walk(libraryDir, "");
	return out.sort((a, b) => a.modified < b.modified ? 1 : a.modified > b.modified ? -1 : 0);
}
/**
* Split Markdown or plain text into headings, paragraphs and fenced code.
* Paragraph text keeps its inline Markdown characters, so saved character
* offsets refer to the file's own text.
* @param source - file content.
* @returns blocks in document order.
*/
function parseBlocks(source) {
	const blocks = [];
	let para = [];
	let code;
	const flush = () => {
		if (para.length > 0) blocks.push({
			kind: "para",
			text: para.join("\n")
		});
		para = [];
	};
	for (const line of source.replace(/\r\n?/g, "\n").split("\n")) {
		if (code !== void 0) {
			if (/^\s*(```|~~~)/.test(line)) {
				blocks.push({
					kind: "code",
					text: code.join("\n")
				});
				code = void 0;
			} else code.push(line);
			continue;
		}
		if (/^\s*(```|~~~)/.test(line)) {
			flush();
			code = [];
			continue;
		}
		const heading = /^(#{1,6})\s+(.*?)\s*#*\s*$/.exec(line);
		if (heading !== null) {
			flush();
			blocks.push({
				kind: "heading",
				level: (heading[1] ?? "").length,
				text: heading[2] ?? ""
			});
		} else if (line.trim() === "") flush();
		else para.push(line.trimEnd());
	}
	if (code !== void 0) blocks.push({
		kind: "code",
		text: code.join("\n")
	});
	flush();
	return blocks;
}
/**
* Read and parse one document.
* @param libraryDir - absolute library folder.
* @param name - document name relative to the library.
* @param maxBytes - larger files are refused.
* @returns the document's blocks.
* @throws {LibraryError} when the document is missing, too large, or badly named.
*/
async function readDoc(libraryDir, name, maxBytes) {
	const path = resolveDoc(libraryDir, name);
	let size;
	try {
		size = (await stat(path)).size;
	} catch (error) {
		throw new LibraryError(404, "no such document");
	}
	if (size > maxBytes) throw new LibraryError(413, `document is larger than ${maxBytes} bytes`);
	return parseBlocks(await readFile(path, "utf8"));
}
function isRecord(value) {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}
function anchorOf(value) {
	if (!isRecord(value)) return void 0;
	const { id, p, start, end, text } = value;
	if (typeof id !== "string" || id === "" || typeof text !== "string") return void 0;
	if (!Number.isInteger(p) || !Number.isInteger(start) || !Number.isInteger(end)) return void 0;
	if (p < 0 || start < 0 || end <= start) return void 0;
	return {
		id,
		p,
		start,
		end,
		text
	};
}
function messageOf(value) {
	if (!isRecord(value) || typeof value.text !== "string") return void 0;
	return value.role === "me" || value.role === "ai" ? {
		role: value.role,
		text: value.text
	} : void 0;
}
/**
* Validate notes read from disk or received from the browser.
* @param value - parsed JSON.
* @returns the notes with malformed entries removed and links to missing sessions dropped.
*/
function cleanNotes(value) {
	if (!isRecord(value)) return EMPTY;
	const highlights = (Array.isArray(value.highlights) ? value.highlights : []).map(anchorOf).filter((item) => item !== void 0);
	const sessions = [];
	for (const raw of Array.isArray(value.sessions) ? value.sessions : []) {
		const anchor = anchorOf(raw);
		if (anchor === void 0 || !isRecord(raw) || !Number.isInteger(raw.n)) continue;
		sessions.push({
			...anchor,
			kind: raw.kind === "comment" ? "comment" : "ai",
			n: raw.n,
			msgs: (Array.isArray(raw.msgs) ? raw.msgs : []).map(messageOf).filter((item) => item !== void 0),
			links: (Array.isArray(raw.links) ? raw.links : []).filter((id) => typeof id === "string"),
			pinned: raw.pinned === true
		});
	}
	const ids = new Set(sessions.map((session) => session.id));
	return {
		highlights,
		sessions: sessions.map((session) => ({
			...session,
			links: session.links.filter((id) => ids.has(id) && id !== session.id)
		}))
	};
}
function notesPath(libraryDir, name) {
	resolveDoc(libraryDir, name);
	return join(libraryDir, NOTES_DIR, `${name}.json`);
}
/**
* Read one document's saved notes.
* @param libraryDir - absolute library folder.
* @param name - document name relative to the library.
* @returns saved notes, or empty notes when none were saved.
* @throws {SyntaxError} when the notes file exists but is not JSON, so it is never silently replaced.
*/
async function readNotes(libraryDir, name) {
	let raw;
	try {
		raw = await readFile(notesPath(libraryDir, name), "utf8");
	} catch (error) {
		if (isRecord(error) && error.code === "ENOENT") return EMPTY;
		throw error;
	}
	return cleanNotes(JSON.parse(raw));
}
/**
* Replace one document's saved notes, writing a temporary file first so an interrupted write leaves the old notes.
* @param libraryDir - absolute library folder.
* @param name - document name relative to the library.
* @param notes - validated notes.
*/
async function writeNotes(libraryDir, name, notes) {
	const path = notesPath(libraryDir, name);
	await mkdir(dirname(path), { recursive: true });
	const temporary = `${path}.${process.pid}.tmp`;
	await writeFile(temporary, `${JSON.stringify(notes, null, 2)}\n`, "utf8");
	await rename(temporary, path);
}
/**
* Find a document in one library folder by the start of its file name.
* @param libraryDir - absolute library folder.
* @param folder - folder relative to the library, with `/` separators.
* @param prefix - the file name equals `<prefix>.md` or starts with `<prefix> `.
* @returns the document name relative to the library, or `undefined` when no file matches or the folder is missing.
*/
async function findDoc(libraryDir, folder, prefix) {
	resolveDoc(libraryDir, `${folder}/x.md`);
	let names;
	try {
		names = await readdir(resolve(libraryDir, ...folder.split("/")));
	} catch (error) {
		if (isRecord(error) && error.code === "ENOENT") return void 0;
		throw error;
	}
	const found = names.sort().find((name) => name === `${prefix}.md` || name.startsWith(`${prefix} `) && name.endsWith(".md"));
	return found === void 0 ? void 0 : `${folder}/${found}`;
}
/**
* Add a document to the library, writing a temporary file first so an interrupted write leaves no partial document.
* @param libraryDir - absolute library folder.
* @param name - document name relative to the library.
* @param text - document content.
* @throws {LibraryError} when the name is not a readable document name inside the library.
*/
async function saveDoc(libraryDir, name, text) {
	const path = resolveDoc(libraryDir, name);
	await mkdir(dirname(path), { recursive: true });
	const temporary = `${path}.${process.pid}.tmp`;
	await writeFile(temporary, text, "utf8");
	await rename(temporary, path);
}
/**
* Text given to the model around a passage: the numbered block holding it and its neighbours.
* @param blocks - the document's blocks.
* @param p - index of the anchored numbered block.
* @param radius - numbered blocks included on each side.
* @returns the neighbouring text with the nearest preceding heading first.
*/
function contextAround(blocks, p, radius) {
	const lines = [];
	let heading = "";
	let index = -1;
	for (const block of blocks) {
		if (block.kind === "heading") {
			if (index < p - radius) heading = block.text;
			else if (index < p + radius) lines.push(`## ${block.text}`);
			continue;
		}
		index += 1;
		if (index < p - radius || index > p + radius) continue;
		lines.push(`[${index + 1}] ${block.text}`);
	}
	return [heading === "" ? "" : `## ${heading}`, ...lines].filter((line) => line !== "").join("\n\n");
}
//#endregion
//#region lib/types/shared.js
/** Wire types and route names shared by the Host routes and the browser page. */
/** Host route path listing the documents in the library folder. */
const READER_DOCS_PATH = "/focus-reader/docs";
/** Host route path returning one document's blocks and saved notes. */
const READER_DOC_PATH = "/focus-reader/doc";
/** Host route path replacing one document's saved notes. */
const READER_NOTES_PATH = "/focus-reader/notes";
/** Host route path answering one AI session message. */
const READER_ASK_PATH = "/focus-reader/ask";
/** Host route path importing a paper from a link into the library folder. */
const READER_ADD_PATH = "/focus-reader/add";
/** Host route path returning one picture of the library folder. */
const READER_PICTURE_PATH = "/focus-reader/picture";
//#endregion
//#region lib/types/index.js
/**
* Host half of focus-reader: authenticated routes on the composition's
* `webServer` that list the documents of one library folder, return a
* document's blocks with its saved notes, replace those notes, and answer an AI
* session message with the composition's default model. One more route imports
* an arXiv paper: it fetches the paper's web-page version and its pictures from
* arxiv.org and saves them in the library folder, the text as Markdown. A last
* route returns one picture of the library.
*
* Every route asks the `connection` service for a rejection first. The model
* call runs outside any Session: its prompt and reply are stored only in the
* document's notes file.
*/
/** Cordis function-plugin name. */
const name = "focus-reader";
/** Route carrier, trust fence, model runtime, and the default model selection. */
const inject = [
	"webServer",
	"connection",
	"llm",
	"agentDefaultModel"
];
/** Validated configuration with defaults. */
const Config = Schema.object({
	libraryDir: Schema.string().required(),
	maxDocBytes: Schema.number().default(2 * 1024 * 1024),
	maxDocs: Schema.number().default(500),
	contextBlocks: Schema.number().default(2),
	maxReplyTokens: Schema.number().default(1200),
	askTimeoutMs: Schema.number().default(12e4),
	systemPrompt: Schema.string().default("You are a reading partner for a researcher. They selected a passage in a document and are discussing it with you. Answer about that passage and the surrounding text you are given. Be direct and brief: a few sentences unless asked for more. Say plainly when the given text does not support a claim or does not contain the answer. Reply in the language of the question."),
	importFolder: Schema.string().default("papers"),
	maxImportBytes: Schema.number().default(16 * 1024 * 1024),
	importTimeoutMs: Schema.number().default(3e4),
	maxImportPictures: Schema.number().default(80),
	maxPictureBytes: Schema.number().default(8 * 1024 * 1024)
});
/** Request bodies are one JSON object: notes for a document, or one session's messages. */
const MAX_BODY_BYTES = 2 * 1024 * 1024;
async function readJsonBody(req) {
	const chunks = [];
	let size = 0;
	for await (const chunk of req) {
		const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk));
		size += buffer.length;
		if (size > MAX_BODY_BYTES) throw new LibraryError(413, "request body too large");
		chunks.push(buffer);
	}
	try {
		return JSON.parse(Buffer.concat(chunks).toString("utf8"));
	} catch (error) {
		throw new LibraryError(400, "request body is not JSON");
	}
}
function sendJson(res, status, payload) {
	res.statusCode = status;
	res.setHeader("content-type", "application/json; charset=utf-8");
	res.setHeader("cache-control", "no-store");
	res.end(JSON.stringify(payload));
}
/**
* Download one file from arxiv.org.
* @param url - address on arxiv.org.
* @param maxBytes - the download stops with a failure once the body is larger.
* @param timeoutMs - longest wait for the whole download.
* @returns the file's bytes and the address that answered after redirects.
* @throws {LibraryError} 404 when arXiv has no such file, 413 when it is too large, 502 for any other failed download.
*/
async function fetchArxiv(url, maxBytes, timeoutMs) {
	let response;
	try {
		response = await fetch(url, {
			signal: AbortSignal.timeout(timeoutMs),
			headers: { "user-agent": "dsh-focus-reader" }
		});
	} catch (error) {
		throw new LibraryError(502, `arxiv.org could not be reached: ${error instanceof Error ? error.message : String(error)}`);
	}
	if (response.status === 404) throw new LibraryError(404, `arxiv.org has no file at ${url}`);
	if (!response.ok || !/(^|\.)arxiv\.org$/.test(new URL(response.url).hostname) || response.body === null) throw new LibraryError(502, `arxiv.org answered ${response.status} for ${url}`);
	const chunks = [];
	let size = 0;
	try {
		for await (const chunk of response.body) {
			size += chunk.length;
			if (size > maxBytes) throw new LibraryError(413, `${url} is larger than ${maxBytes} bytes`);
			chunks.push(chunk);
		}
	} catch (error) {
		if (error instanceof LibraryError) throw error;
		throw new LibraryError(502, `the download from arxiv.org stopped: ${error instanceof Error ? error.message : String(error)}`);
	}
	return {
		bytes: Buffer.concat(chunks),
		url: response.url
	};
}
/** Downloads of one paper's pictures that run at the same time. */
const PICTURE_LANES = 4;
/**
* Register the reader routes.
* @param ctx - host services: web server, connection trust fence, model runtime, default model.
* @param config - validated configuration.
*/
function apply(ctx, config) {
	const libraryDir = expandDir(config.libraryDir);
	resolveDoc(libraryDir, `${config.importFolder}/x.md`);
	const connection = Reflect.get(ctx, "connection");
	const route = (path, methods) => {
		ctx.effect(() => ctx.webServer.register({
			kind: "exact",
			path,
			handler: async (req, res) => {
				const rejection = connection.requestRejection(req);
				if (rejection !== void 0) {
					res.statusCode = rejection;
					res.end();
					return;
				}
				const handler = methods[req.method ?? ""];
				if (handler === void 0) {
					res.statusCode = 405;
					res.setHeader("allow", Object.keys(methods).join(", "));
					res.end();
					return;
				}
				try {
					sendJson(res, 200, await handler(req, new URL(req.url ?? "", "http://local")));
				} catch (error) {
					sendJson(res, error instanceof LibraryError ? error.status : 500, { error: error instanceof Error ? error.message : String(error) });
				}
			}
		}), `focus-reader: ${path}`);
	};
	const nameOf = (url) => url.searchParams.get("name") ?? "";
	route(READER_DOCS_PATH, { GET: async () => ({
		libraryDir,
		docs: await listDocs(libraryDir, config.maxDocs)
	}) });
	route(READER_DOC_PATH, { GET: async (_req, url) => {
		const doc = nameOf(url);
		return {
			name: doc,
			blocks: await readDoc(libraryDir, doc, config.maxDocBytes),
			notes: await readNotes(libraryDir, doc)
		};
	} });
	route(READER_NOTES_PATH, { PUT: async (req, url) => {
		const doc = nameOf(url);
		await readDoc(libraryDir, doc, config.maxDocBytes);
		await writeNotes(libraryDir, doc, cleanNotes(await readJsonBody(req)));
		return { saved: true };
	} });
	route(READER_ADD_PATH, { POST: async (req) => {
		const body = await readJsonBody(req);
		const paper = arxivPaper(typeof body === "object" && body !== null && "url" in body && typeof body.url === "string" ? body.url : "");
		if (paper === void 0) throw new LibraryError(400, "this is not an arXiv paper link. Paste an address such as https://arxiv.org/abs/2610.11291");
		const refresh = typeof body === "object" && body !== null && "refresh" in body && body.refresh === true;
		const existing = await findDoc(libraryDir, config.importFolder, paper.id);
		if (existing !== void 0 && !refresh) return {
			name: existing,
			existing: true,
			pictures: 0,
			missingPictures: 0
		};
		let page;
		try {
			page = await fetchArxiv(paper.htmlUrl, config.maxImportBytes, config.importTimeoutMs);
		} catch (error) {
			if (error instanceof LibraryError && error.status === 404) throw new LibraryError(404, "arXiv has no web-page version of this paper. It only has the PDF, which the reader cannot convert.");
			throw error;
		}
		const converted = arxivToMarkdown(page.bytes.toString("utf8"), {
			sourceUrl: paper.absUrl,
			pageUrl: page.url,
			pictureFolder: paper.id
		});
		if (converted.title === "" || converted.paragraphs < 3) throw new LibraryError(502, "the page arxiv.org returned holds no paper text");
		const missing = new Set(converted.pictures.slice(config.maxImportPictures).map((picture) => picture.line));
		const queue = converted.pictures.slice(0, config.maxImportPictures);
		await Promise.all(Array.from({ length: PICTURE_LANES }, async () => {
			for (let picture = queue.shift(); picture !== void 0; picture = queue.shift()) try {
				const file = await fetchArxiv(picture.url, config.maxPictureBytes, config.importTimeoutMs);
				await savePicture(libraryDir, `${config.importFolder}/${paper.id}/${picture.file}`, file.bytes);
			} catch (error) {
				if (!(error instanceof LibraryError)) throw error;
				missing.add(picture.line);
			}
		}));
		const blocks = converted.blocks.map((block) => missing.has(block) ? "[Picture not downloaded — see the original]" : block);
		const doc = existing ?? `${config.importFolder}/${paperFileName(paper.id, converted.title)}`;
		await saveDoc(libraryDir, doc, `${blocks.join("\n\n")}\n`);
		return {
			name: doc,
			existing: false,
			pictures: converted.pictures.length - missing.size,
			missingPictures: missing.size
		};
	} });
	ctx.effect(() => ctx.webServer.register({
		kind: "exact",
		path: READER_PICTURE_PATH,
		handler: async (req, res) => {
			const rejection = connection.requestRejection(req);
			if (rejection !== void 0) {
				res.statusCode = rejection;
				res.end();
				return;
			}
			if (req.method !== "GET") {
				res.statusCode = 405;
				res.setHeader("allow", "GET");
				res.end();
				return;
			}
			try {
				const picture = await readPicture(libraryDir, nameOf(new URL(req.url ?? "", "http://local")), config.maxPictureBytes);
				res.statusCode = 200;
				res.setHeader("content-type", picture.type);
				res.setHeader("x-content-type-options", "nosniff");
				res.setHeader("content-security-policy", "sandbox; default-src 'none'; style-src 'unsafe-inline'");
				res.setHeader("cache-control", "private, max-age=3600");
				res.end(picture.bytes);
			} catch (error) {
				sendJson(res, error instanceof LibraryError ? error.status : 500, { error: error instanceof Error ? error.message : String(error) });
			}
		}
	}), `focus-reader: ${READER_PICTURE_PATH}`);
	route(READER_ASK_PATH, { POST: async (req) => {
		const body = await readJsonBody(req);
		const fields = typeof body === "object" && body !== null ? body : {};
		const doc = typeof fields.name === "string" ? fields.name : "";
		const passage = typeof fields.passage === "string" ? fields.passage : "";
		const p = Number.isInteger(fields.p) ? fields.p : -1;
		const msgs = cleanNotes({ sessions: [{
			id: "x",
			p: 0,
			start: 0,
			end: 1,
			text: "",
			n: 1,
			msgs: fields.msgs
		}] }).sessions[0]?.msgs ?? [];
		const question = msgs.at(-1);
		if (passage === "" || p < 0 || question?.role !== "me" || question.text.trim() === "") throw new LibraryError(400, "name, p, passage and a final message from the reader are required");
		const blocks = await readDoc(libraryDir, doc, config.maxDocBytes);
		const earlier = msgs.slice(0, -1);
		const text = [
			`Document: ${doc}`,
			`Surrounding text (numbers are paragraph numbers):\n${contextAround(blocks, p, config.contextBlocks)}`,
			`Selected passage, in paragraph ${p + 1}:\n"${passage}"`,
			earlier.length === 0 ? "" : `Conversation so far:\n${earlier.map((m) => `${m.role === "me" ? "Reader" : "You"}: ${m.text}`).join("\n\n")}`,
			`Reader: ${question.text}`
		].filter((part) => part !== "").join("\n\n");
		const { provider, model } = ctx.agentDefaultModel.currentSelection();
		const signal = AbortSignal.timeout(config.askTimeoutMs);
		const assembler = new BlockAssembler();
		const stream = ctx.llm.stream({
			provider,
			model,
			system: config.systemPrompt,
			messages: [{
				role: "user",
				content: [{
					type: "text",
					text
				}]
			}],
			maxTokens: config.maxReplyTokens,
			signal
		});
		for await (const chunk of stream) {
			assembler.push(chunk);
			if (chunk.type === "finish" && (chunk.reason.kind === "error" || chunk.reason.kind === "aborted")) throw new Error(`the model did not answer (${chunk.reason.failure.code}): ${chunk.reason.failure.message}`);
		}
		const reply = assembler.blocks().map((block) => block.type === "text" ? block.text : "").join("").trim();
		if (reply === "") throw new Error("the model returned no text");
		return {
			text: reply,
			model: `${provider}/${model}`
		};
	} });
}
//#endregion
export { Config, apply, inject, name };
