import Schema from "@deepseek-ai/schemastery";
import { BlockAssembler } from "@deepseek-ai/dsh-llm";
import { mkdir, readFile, readdir, rename, stat, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, extname, join, resolve, sep } from "node:path";
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
	const parts = name.split("/");
	if (name === "" || parts.some((part) => part === "" || part.startsWith("."))) throw new LibraryError(400, "invalid document name");
	if (!EXTENSIONS.has(extname(name).toLowerCase())) throw new LibraryError(400, "only .md, .markdown and .txt files can be read");
	const path = resolve(libraryDir, ...parts);
	if (!path.startsWith(libraryDir + sep)) throw new LibraryError(400, "invalid document name");
	return path;
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
//#endregion
//#region lib/types/index.js
/**
* Host half of focus-reader: authenticated routes on the composition's
* `webServer` that list the documents of one library folder, return a
* document's blocks with its saved notes, replace those notes, and answer an AI
* session message with the composition's default model.
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
	systemPrompt: Schema.string().default("You are a reading partner for a researcher. They selected a passage in a document and are discussing it with you. Answer about that passage and the surrounding text you are given. Be direct and brief: a few sentences unless asked for more. Say plainly when the given text does not support a claim or does not contain the answer. Reply in the language of the question.")
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
* Register the reader routes.
* @param ctx - host services: web server, connection trust fence, model runtime, default model.
* @param config - validated configuration.
*/
function apply(ctx, config) {
	const libraryDir = expandDir(config.libraryDir);
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
