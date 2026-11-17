import Schema from "@deepseek-ai/schemastery";
//#region lib/types/attempt.js
/**
* One sign-in attempt as the card sees it: the step the flow last reported and
* the single question it may be waiting on. The object answers the flow's
* questions; it starts nothing and stores no token.
*/
/** Option ids the ChatGPT sign-in flow offers when it asks how to sign in. */
const WAY_OPTIONS = {
	browser: "browser",
	code: "device_code"
};
/** Tracks one attempt's step and pending question. */
var Attempt = class {
	way;
	current;
	waiting;
	/** @param way - how the person chose to sign in. */
	constructor(way) {
		this.way = way;
	}
	/** The step the flow last reported, if any. */
	get step() {
		return this.current;
	}
	/** Whether the flow is waiting for a pasted address or code. */
	get canPaste() {
		return this.waiting !== void 0;
	}
	/**
	* Keep the flow's latest notice as the current step. A later notice without
	* a page or code keeps the ones the person still needs. An address that is
	* not `https:` is dropped, so the card never links anywhere else.
	* @param notice - what the flow reported.
	*/
	notify(notice) {
		const url = notice.url !== void 0 && /^https:\/\//i.test(notice.url) ? notice.url : this.current?.url;
		const code = notice.code ?? this.current?.code;
		this.current = {
			message: notice.message,
			...url === void 0 ? {} : { url },
			...code === void 0 ? {} : { code }
		};
	}
	/**
	* Answer one question from the flow. The choice of way is answered at once;
	* a text question waits for {@link paste}.
	* @param prompt - what the flow asked.
	* @returns the chosen option id, or the pasted text.
	* @throws when the flow offers no option for the chosen way, asks for a secret, asks a second text question while one waits, or withdraws the question.
	*/
	prompt(prompt) {
		if (prompt.kind === "select") {
			const wanted = WAY_OPTIONS[this.way];
			if (prompt.options.some((option) => option.id === wanted)) return Promise.resolve(wanted);
			return Promise.reject(/* @__PURE__ */ new Error(`the sign-in offers no "${wanted}" option; it offers: ${prompt.options.map((option) => option.id).join(", ")}`));
		}
		if (prompt.kind === "secret") return Promise.reject(/* @__PURE__ */ new Error("this sign-in asked for a secret, which this page never collects"));
		if (this.waiting !== void 0) return Promise.reject(/* @__PURE__ */ new Error("the sign-in asked a second question before the first was answered"));
		if (prompt.signal?.aborted === true) return Promise.reject(/* @__PURE__ */ new Error("the sign-in withdrew its question"));
		return new Promise((resolve, reject) => {
			const waiting = { resolve: (text) => {
				prompt.signal?.removeEventListener("abort", withdrawn);
				resolve(text);
			} };
			const withdrawn = () => {
				if (this.waiting === waiting) this.waiting = void 0;
				reject(/* @__PURE__ */ new Error("the sign-in withdrew its question"));
			};
			prompt.signal?.addEventListener("abort", withdrawn, { once: true });
			this.waiting = waiting;
		});
	}
	/**
	* Hand the waiting question its answer.
	* @param text - the address the browser ended on, or the code it showed.
	* @returns false when no question is waiting.
	*/
	paste(text) {
		const waiting = this.waiting;
		if (waiting === void 0) return false;
		this.waiting = void 0;
		waiting.resolve(text);
		return true;
	}
};
//#endregion
//#region lib/types/shared.js
/** Wire types and route names shared by the Host routes and the browser card. */
/** Host route path returning the sign-in state. */
const SIGNIN_STATE_PATH = "/chatgpt-signin/state";
/** Host route path starting one sign-in attempt. */
const SIGNIN_START_PATH = "/chatgpt-signin/start";
/** Host route path handing the running attempt the address the browser ended on. */
const SIGNIN_PASTE_PATH = "/chatgpt-signin/paste";
/** Host route path stopping the running attempt. */
const SIGNIN_CANCEL_PATH = "/chatgpt-signin/cancel";
/** Host route path adding the provider to the model picker. */
const SIGNIN_PICKER_PATH = "/chatgpt-signin/picker";
/** Host route path deleting the stored sign-in. */
const SIGNIN_SIGNOUT_PATH = "/chatgpt-signin/signout";
//#endregion
//#region lib/types/index.js
/**
* Host half of chatgpt-signin: authenticated routes on the composition's
* `webServer` that start, watch, stop and undo one account sign-in.
*
* The plugin owns no sign-in protocol. It starts the flow another plugin
* registered with `ctx.authorization` (by default the ChatGPT flow of
* `llm-pi-ai`), relays that flow's notices to the card, and answers its
* questions. The flow stores the resulting grant in the credential store; no
* route here reads or returns it. After a successful sign-in the provider's
* route is added to the `providers` settings of the model adapter, which is
* what puts its models in the model picker.
*
* Every route asks the `connection` service for a rejection first.
*/
/** Cordis function-plugin name. */
const name = "chatgpt-signin";
/** Route carrier, trust fence, the sign-in flows, the grant store, and the settings the model picker reads. */
const inject = [
	"webServer",
	"connection",
	"authorization",
	"credentials",
	"settings"
];
/** Validated configuration with defaults. */
const Config = Schema.object({
	provider: Schema.string().default("openai-codex"),
	recordScope: Schema.string().default("llm-pi-ai"),
	settingsEntry: Schema.string().default("llm-pi-ai"),
	addToPicker: Schema.boolean().default(true),
	pickerName: Schema.string().default("ChatGPT"),
	attemptTimeoutMs: Schema.number().default(15 * 6e4)
});
/** The flow method this plugin runs; an account sign-in, never a typed API key. */
const METHOD = "oauth";
/** Grammar of one segment of a credential record address, as the credential store defines it. */
const KEY_SEGMENT = /^[a-z][a-z0-9-]*$/;
/** Request bodies are one small JSON object. */
const MAX_BODY_BYTES = 16 * 1024;
/** Longest pasted address or code accepted. */
const MAX_PASTE_CHARS = 4096;
/** A refused request with its HTTP status. */
var SignInError = class extends Error {
	status;
	constructor(status, message) {
		super(message);
		this.status = status;
		this.name = "SignInError";
	}
};
function isRecord(value) {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}
function messageOf(error) {
	return error instanceof Error ? error.message : String(error);
}
async function readJsonBody(req) {
	const chunks = [];
	let size = 0;
	for await (const chunk of req) {
		const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk));
		size += buffer.length;
		if (size > MAX_BODY_BYTES) throw new SignInError(413, "request body too large");
		chunks.push(buffer);
	}
	let body;
	try {
		body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
	} catch (error) {
		throw new SignInError(400, "request body is not JSON");
	}
	if (!isRecord(body)) throw new SignInError(400, "request body is not a JSON object");
	return body;
}
function sendJson(res, status, payload) {
	res.statusCode = status;
	res.setHeader("content-type", "application/json; charset=utf-8");
	res.setHeader("cache-control", "no-store");
	res.end(JSON.stringify(payload));
}
/**
* Register the sign-in routes.
* @param ctx - host services named by {@link inject}.
* @param config - which flow to run and what to do after it.
*/
function apply(ctx, config) {
	for (const segment of [config.recordScope, config.provider]) if (!KEY_SEGMENT.test(segment)) throw new Error(`chatgpt-signin: "${segment}" cannot address a stored sign-in; use lowercase letters, digits and hyphens`);
	const key = `${config.recordScope}/${config.provider}`;
	const connection = Reflect.get(ctx, "connection");
	const route = ["providers", config.provider];
	let attempt;
	let last;
	const inPicker = () => {
		const section = ctx.settings.describe().find((row) => row.ns === config.settingsEntry)?.value;
		const providers = isRecord(section) ? section["providers"] : void 0;
		return isRecord(providers) && Object.hasOwn(providers, config.provider);
	};
	const addToPicker = async () => {
		if (inPicker()) return;
		const profile = config.pickerName === "" ? {} : { displayName: config.pickerName };
		await ctx.settings.mutate(config.settingsEntry, [{
			op: "set",
			path: route,
			value: profile
		}]);
	};
	const state = async () => {
		const flow = ctx.authorization.describe(key);
		return {
			available: flow?.methods.some((method) => method.id === METHOD) === true,
			label: flow?.label ?? config.provider,
			signedIn: (await ctx.credentials.describeRecord(key)).configured,
			inPicker: inPicker(),
			running: attempt !== void 0,
			...attempt === void 0 ? {} : { way: attempt.way },
			...attempt?.step === void 0 ? {} : { step: attempt.step },
			canPaste: attempt?.canPaste === true,
			...last === void 0 ? {} : { last }
		};
	};
	const start = (way) => {
		if (attempt !== void 0) throw new SignInError(409, "a sign-in is already running");
		const mine = new Attempt(way);
		attempt = mine;
		last = void 0;
		ctx.authorization.begin({
			key,
			method: METHOD,
			signal: AbortSignal.timeout(config.attemptTimeoutMs),
			interaction: {
				notify: (notice) => {
					mine.notify(notice);
				},
				prompt: (prompt) => mine.prompt(prompt)
			}
		}).then(async (outcome) => {
			if (outcome.status !== "authorized") return { status: "cancelled" };
			if (!config.addToPicker) return { status: "authorized" };
			try {
				await addToPicker();
				return { status: "authorized" };
			} catch (error) {
				return {
					status: "authorized",
					message: messageOf(error)
				};
			}
		}, (error) => ({
			status: "failed",
			message: messageOf(error)
		})).then((ending) => {
			if (attempt === mine) attempt = void 0;
			last = ending;
		});
	};
	ctx.effect(() => () => {
		if (attempt !== void 0) ctx.authorization.cancel(key);
	}, "chatgpt-signin: running attempt");
	const serve = (path, methods) => {
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
					sendJson(res, 200, await handler(req));
				} catch (error) {
					sendJson(res, error instanceof SignInError ? error.status : 500, { error: messageOf(error) });
				}
			}
		}), `chatgpt-signin: ${path}`);
	};
	serve(SIGNIN_STATE_PATH, { GET: () => state() });
	serve(SIGNIN_START_PATH, { POST: async (req) => {
		const way = (await readJsonBody(req))["way"];
		if (way !== "browser" && way !== "code") throw new SignInError(400, "way must be \"browser\" or \"code\"");
		start(way);
		return state();
	} });
	serve(SIGNIN_PASTE_PATH, { POST: async (req) => {
		const text = (await readJsonBody(req))["text"];
		if (typeof text !== "string" || text.trim() === "" || text.length > MAX_PASTE_CHARS) throw new SignInError(400, "text must be the address the browser ended on, or the code it showed");
		if (attempt?.paste(text.trim()) !== true) throw new SignInError(409, "the sign-in is not waiting for an address");
		return state();
	} });
	serve(SIGNIN_CANCEL_PATH, { POST: () => {
		ctx.authorization.cancel(key);
		return state();
	} });
	serve(SIGNIN_PICKER_PATH, { POST: async () => {
		await addToPicker();
		if (last?.status === "authorized") last = { status: "authorized" };
		return state();
	} });
	serve(SIGNIN_SIGNOUT_PATH, { POST: async () => {
		if (attempt !== void 0) throw new SignInError(409, "a sign-in is running; stop it first");
		await ctx.credentials.deleteRecord(key);
		last = void 0;
		if (config.addToPicker && inPicker()) await ctx.settings.mutate(config.settingsEntry, [{
			op: "unset",
			path: route
		}]);
		return state();
	} });
}
//#endregion
export { Config, apply, inject, name };
