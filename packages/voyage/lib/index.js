import { randomUUID } from "node:crypto";
import Schema from "@deepseek-ai/schemastery";
import { BlockAssembler } from "@deepseek-ai/dsh-llm";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join, resolve } from "node:path";
//#region lib/types/shared.js
/** Wire types and route names shared by the Host routes and the browser pages. */
/** Host route path returning one day's steps and every captured thought. */
const VOYAGE_STATE_PATH = "/voyage/state";
/** Host route path replacing one day's three steps. */
const VOYAGE_DAY_PATH = "/voyage/day";
/** Host route path adding (POST) or changing (PUT) one thought. */
const VOYAGE_THOUGHT_PATH = "/voyage/thought";
/** Host route path asking the model to group the open thoughts. */
const VOYAGE_SORT_PATH = "/voyage/sort";
//#endregion
//#region lib/types/store.js
/**
* The voyage data file: every day's three steps and every captured thought,
* kept as one JSON file in the configured folder. Functions here are pure
* except {@link readStore} and {@link writeStore}.
*/
/** A request that cannot be served, with the HTTP status that reports it. */
var StoreError = class extends Error {
	status;
	/**
	* @param status - HTTP status for the response.
	* @param message - reason shown to the person.
	*/
	constructor(status, message) {
		super(message);
		this.status = status;
	}
};
const FILE_NAME = "voyage.json";
const DATE = /^\d{4}-\d{2}-\d{2}$/;
/**
* Resolve the configured folder, expanding a leading `~`.
* @param dir - configured folder.
* @returns absolute path.
*/
function expandDir(dir) {
	return resolve(dir === "~" || dir.startsWith("~/") ? join(homedir(), dir.slice(1)) : dir);
}
/**
* Check a calendar date string.
* @param value - candidate from a request.
* @returns the date.
*/
function requireDate(value) {
	if (typeof value !== "string" || !DATE.test(value)) throw new StoreError(400, "date must be YYYY-MM-DD");
	return value;
}
function cleanSteps(value) {
	const list = Array.isArray(value) ? value : [];
	return Array.from({ length: 3 }, (_, index) => {
		const step = typeof list[index] === "object" && list[index] !== null ? list[index] : {};
		return {
			text: typeof step.text === "string" ? step.text : "",
			done: step.done === true
		};
	});
}
/**
* Keep the well-formed parts of a parsed data file.
* @param value - parsed JSON of unknown structure.
* @returns a data file with exactly three steps per day and only complete thoughts.
*/
function cleanFile(value) {
	const fields = typeof value === "object" && value !== null ? value : {};
	const rawDays = typeof fields.days === "object" && fields.days !== null ? fields.days : {};
	const days = {};
	for (const [date, steps] of Object.entries(rawDays)) if (DATE.test(date)) days[date] = cleanSteps(steps);
	const thoughts = [];
	for (const item of Array.isArray(fields.thoughts) ? fields.thoughts : []) {
		const thought = typeof item === "object" && item !== null ? item : {};
		if (typeof thought.id !== "string" || thought.id === "" || typeof thought.text !== "string" || thought.text.trim() === "") continue;
		thoughts.push({
			id: thought.id,
			text: thought.text,
			created: typeof thought.created === "string" ? thought.created : "",
			group: typeof thought.group === "string" ? thought.group : "",
			done: thought.done === true
		});
	}
	return {
		days,
		thoughts
	};
}
/**
* Read the data file.
* @param dir - absolute data folder.
* @returns the saved data, or an empty file when none exists yet.
*/
async function readStore(dir) {
	let text;
	try {
		text = await readFile(join(dir, FILE_NAME), "utf8");
	} catch (error) {
		if (error.code === "ENOENT") return {
			days: {},
			thoughts: []
		};
		throw error;
	}
	try {
		return cleanFile(JSON.parse(text));
	} catch (error) {
		throw new StoreError(500, `${join(dir, FILE_NAME)} is not valid JSON; fix or move it, then reload`);
	}
}
/**
* Replace the data file through a temporary file and a rename.
* @param dir - absolute data folder.
* @param file - data to save.
*/
async function writeStore(dir, file) {
	await mkdir(dir, { recursive: true });
	const target = join(dir, FILE_NAME);
	const temp = `${target}.${process.pid}.tmp`;
	await writeFile(temp, `${JSON.stringify(file, null, 2)}\n`, "utf8");
	await rename(temp, target);
}
/**
* One day's steps.
* @param file - data file.
* @param date - calendar date.
* @returns the saved steps, or three empty ones.
*/
function dayOf(file, date) {
	return {
		date,
		steps: file.days[date] ?? cleanSteps([])
	};
}
/**
* Replace one day's steps.
* @param file - data file.
* @param date - calendar date.
* @param steps - steps from a request.
* @returns the changed data file.
*/
function withDay(file, date, steps) {
	return {
		...file,
		days: {
			...file.days,
			[date]: cleanSteps(steps)
		}
	};
}
/**
* Add a captured thought.
* @param file - data file.
* @param thought - id, text and capture time.
* @param max - most thoughts the file may hold.
* @returns the changed data file.
*/
function withThought(file, thought, max) {
	const text = thought.text.trim();
	if (text === "") throw new StoreError(400, "a thought needs some text");
	if (file.thoughts.length >= max) throw new StoreError(409, `the waiting list is full (${max}); mark some thoughts done first`);
	return {
		...file,
		thoughts: [...file.thoughts, {
			id: thought.id,
			text,
			created: thought.created,
			group: "",
			done: false
		}]
	};
}
/**
* Mark one thought done or not done.
* @param file - data file.
* @param id - thought id.
* @param done - new state.
* @returns the changed data file.
*/
function withDone(file, id, done) {
	if (!file.thoughts.some((thought) => thought.id === id)) throw new StoreError(404, "that thought no longer exists");
	return {
		...file,
		thoughts: file.thoughts.map((thought) => thought.id === id ? {
			...thought,
			done
		} : thought)
	};
}
/**
* The text given to the model for one sort. Thoughts are numbered from 1 so the reply can refer to them briefly.
* @param open - thoughts to sort, in order.
* @param groups - group names to choose from.
* @returns prompt text.
*/
function sortRequest(open, groups) {
	return [
		`Groups:\n${groups.map((group) => `- ${group}`).join("\n")}`,
		`Thoughts:\n${open.map((thought, index) => `${index + 1}. ${thought.text.replace(/\s+/g, " ")}`).join("\n")}`,
		"Reply with only a JSON object whose keys are the thought numbers and whose values are group names copied exactly from the list."
	].join("\n\n");
}
/**
* Apply a model reply to the open thoughts.
* @param file - data file.
* @param open - the thoughts that were sent, in the order they were numbered.
* @param reply - model text containing one JSON object.
* @param groups - allowed group names.
* @returns the changed data file; a thought the reply leaves out or gives an unknown group keeps its current group.
*/
function withGroups(file, open, reply, groups) {
	const start = reply.indexOf("{");
	const end = reply.lastIndexOf("}");
	let parsed;
	try {
		parsed = JSON.parse(reply.slice(start, end + 1));
	} catch (error) {
		throw new StoreError(502, "the model did not return a sortable answer; nothing was changed");
	}
	const answers = typeof parsed === "object" && parsed !== null ? parsed : {};
	const chosen = /* @__PURE__ */ new Map();
	open.forEach((thought, index) => {
		const group = answers[String(index + 1)];
		if (typeof group === "string" && groups.includes(group)) chosen.set(thought.id, group);
	});
	if (chosen.size === 0) throw new StoreError(502, "the model did not place any thought in a known group; nothing was changed");
	return {
		...file,
		thoughts: file.thoughts.map((thought) => ({
			...thought,
			group: chosen.get(thought.id) ?? thought.group
		}))
	};
}
//#endregion
//#region lib/types/index.js
/**
* Host half of voyage: authenticated routes on the composition's `webServer`
* that return and replace a day's three steps, add and close captured
* thoughts, and ask the composition's default model to group the open ones.
*
* Every route asks the `connection` service for a rejection first. Changes to
* the data file run one at a time. The model call runs outside any Session:
* the thoughts it reads and the groups it returns are stored only in the data file.
*/
/** Cordis function-plugin name. */
const name = "voyage";
/** Route carrier, trust fence, model runtime, and the default model selection. */
const inject = [
	"webServer",
	"connection",
	"llm",
	"agentDefaultModel"
];
/** Validated configuration with defaults. */
const Config = Schema.object({
	dataDir: Schema.string().required(),
	groups: Schema.array(Schema.string()).default([
		"Needs your decision",
		"For the project",
		"Life upkeep",
		"Ideas to keep"
	]),
	maxThoughts: Schema.number().default(2e3),
	maxSortThoughts: Schema.number().default(200),
	maxSortTokens: Schema.number().default(2e3),
	sortTimeoutMs: Schema.number().default(12e4),
	sortPrompt: Schema.string().default("You sort short notes a person captured while concentrating on something else. Place every note in exactly one of the given groups, choosing by what the person would need to do with it.")
});
/** Request bodies are one small JSON object. */
const MAX_BODY_BYTES = 256 * 1024;
async function readJsonBody(req) {
	const chunks = [];
	let size = 0;
	for await (const chunk of req) {
		const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk));
		size += buffer.length;
		if (size > MAX_BODY_BYTES) throw new StoreError(413, "request body too large");
		chunks.push(buffer);
	}
	let body;
	try {
		body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
	} catch (error) {
		throw new StoreError(400, "request body is not JSON");
	}
	return typeof body === "object" && body !== null ? body : {};
}
/**
* Register the voyage routes.
* @param ctx - host services: web server, connection trust fence, model runtime, default model.
* @param config - validated configuration.
*/
function apply(ctx, config) {
	if (config.groups.length === 0) throw new Error("voyage: `groups` needs at least one group name");
	const dataDir = expandDir(config.dataDir);
	const connection = Reflect.get(ctx, "connection");
	let queue = Promise.resolve();
	const change = (date, edit) => {
		const run = queue.then(async () => {
			const file = await edit(await readStore(dataDir));
			await writeStore(dataDir, file);
			return payload(file, date);
		});
		queue = run.catch(() => void 0);
		return run;
	};
	const payload = (file, date) => ({
		day: dayOf(file, date),
		thoughts: file.thoughts,
		groups: config.groups
	});
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
				let status = 200;
				let body;
				try {
					body = await handler(req, new URL(req.url ?? "", "http://local"));
				} catch (error) {
					status = error instanceof StoreError ? error.status : 500;
					body = { error: error instanceof Error ? error.message : String(error) };
				}
				res.statusCode = status;
				res.setHeader("content-type", "application/json; charset=utf-8");
				res.setHeader("cache-control", "no-store");
				res.end(JSON.stringify(body));
			}
		}), `voyage: ${path}`);
	};
	route(VOYAGE_STATE_PATH, { GET: async (_req, url) => payload(await readStore(dataDir), requireDate(url.searchParams.get("date"))) });
	route(VOYAGE_DAY_PATH, { PUT: async (req) => {
		const body = await readJsonBody(req);
		const date = requireDate(body.date);
		return change(date, (file) => withDay(file, date, body.steps));
	} });
	route(VOYAGE_THOUGHT_PATH, {
		POST: async (req) => {
			const body = await readJsonBody(req);
			const date = requireDate(body.date);
			const text = typeof body.text === "string" ? body.text : "";
			return change(date, (file) => withThought(file, {
				id: randomUUID(),
				text,
				created: (/* @__PURE__ */ new Date()).toISOString()
			}, config.maxThoughts));
		},
		PUT: async (req) => {
			const body = await readJsonBody(req);
			const date = requireDate(body.date);
			if (typeof body.id !== "string" || typeof body.done !== "boolean") throw new StoreError(400, "id and done are required");
			const { id, done } = body;
			return change(date, (file) => withDone(file, id, done));
		}
	});
	route(VOYAGE_SORT_PATH, { POST: async (req) => {
		const date = requireDate((await readJsonBody(req)).date);
		const open = (await readStore(dataDir)).thoughts.filter((thought) => !thought.done).slice(-config.maxSortThoughts);
		if (open.length === 0) throw new StoreError(400, "there is nothing waiting to sort");
		const { provider, model } = ctx.agentDefaultModel.currentSelection();
		const assembler = new BlockAssembler();
		const stream = ctx.llm.stream({
			provider,
			model,
			system: config.sortPrompt,
			messages: [{
				role: "user",
				content: [{
					type: "text",
					text: sortRequest(open, config.groups)
				}]
			}],
			maxTokens: config.maxSortTokens,
			signal: AbortSignal.timeout(config.sortTimeoutMs)
		});
		for await (const chunk of stream) {
			assembler.push(chunk);
			if (chunk.type === "finish" && (chunk.reason.kind === "error" || chunk.reason.kind === "aborted")) throw new StoreError(502, `the model did not answer (${chunk.reason.failure.code}): ${chunk.reason.failure.message}`);
		}
		const reply = assembler.blocks().map((block) => block.type === "text" ? block.text : "").join("");
		return change(date, (file) => withGroups(file, open, reply, config.groups));
	} });
}
//#endregion
export { Config, apply, inject, name };
