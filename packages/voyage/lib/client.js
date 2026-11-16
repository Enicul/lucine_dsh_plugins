window.__ModuleLoader__.load({
	id: "dsh-voyage",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react_jsx_runtime = require("react/jsx-runtime");
		let react = require("react");
		let react_dom = require("react-dom");
		//#region \0dsh-css:./src/client/Voyage.module.css.mjs
		const css = ".Hm-TGG_page{--vy-ink:#eef2ff;--vy-dim:#b4bfdf;--vy-glass:#141c3ead;--vy-line:#c8d7ff33;--vy-fire:#ffd27a;--vy-tide:#8cfff0;width:100%;min-width:0;height:100%;min-height:0;color:var(--vy-ink);background:#141c44;font-size:14px;line-height:1.5;display:flex;position:relative;overflow:hidden}.Hm-TGG_scene{object-fit:cover;width:100%;height:100%;position:absolute;inset:0}.Hm-TGG_stage{flex-direction:column;flex:1;gap:12px;min-width:0;min-height:0;padding:14px 20px 24px;display:flex;position:relative;overflow:auto}.Hm-TGG_tabs{gap:4px;margin-inline-start:max(0px, calc(var(--dsh-frame-leading-clearance,0px) - 20px));display:flex}.Hm-TGG_tab,.Hm-TGG_tabOn{color:var(--vy-dim);background:var(--vy-glass);backdrop-filter:blur(8px);font:inherit;cursor:pointer;border:0;border-radius:999px;padding:6px 14px}.Hm-TGG_tab:hover{color:var(--vy-ink)}.Hm-TGG_tabOn{color:var(--vy-fire);background:#3c3446bf;font-weight:600}.Hm-TGG_small{color:var(--vy-dim);letter-spacing:.03em;font-size:12px}.Hm-TGG_title{text-wrap:balance;margin:0;font-size:18px;font-weight:600;line-height:1.3}.Hm-TGG_error{border:1px solid var(--vy-fire);color:var(--vy-fire);background:var(--vy-glass);border-radius:10px;margin:0;padding:8px 12px}.Hm-TGG_next{background:var(--vy-glass);backdrop-filter:blur(10px);border-radius:16px;flex-direction:column;align-self:flex-start;gap:4px;max-width:min(520px,100%);margin-top:auto;padding:16px;display:flex}.Hm-TGG_column{flex-direction:column;gap:10px;width:min(640px,100%);margin:0 auto;display:flex}.Hm-TGG_head{flex-wrap:wrap;justify-content:space-between;align-items:flex-end;gap:10px;display:flex}.Hm-TGG_sort{color:var(--vy-tide);font:inherit;cursor:pointer;background:#143c50b3;border:1px solid #8cfff080;border-radius:999px;padding:7px 14px;font-weight:600}.Hm-TGG_sort:disabled{opacity:.6;cursor:default}.Hm-TGG_group{flex-direction:column;gap:8px;display:flex}.Hm-TGG_groupName{color:var(--vy-fire);letter-spacing:.06em;text-transform:uppercase;margin:8px 0 0;font-size:12px;font-weight:600}.Hm-TGG_row{border:1px solid var(--vy-line);background:var(--vy-glass);backdrop-filter:blur(8px);border-radius:12px;align-items:center;gap:10px;padding:9px 11px;display:flex}.Hm-TGG_rowText{overflow-wrap:anywhere;flex:1;min-width:0}.Hm-TGG_rowDone,.Hm-TGG_fold{border:1px solid var(--vy-line);color:var(--vy-dim);font:inherit;cursor:pointer;background:0 0;border-radius:999px;padding:3px 10px;font-size:12px}.Hm-TGG_rowDone:hover,.Hm-TGG_fold:hover{color:var(--vy-ink)}.Hm-TGG_side{border-left:1px solid var(--vy-line);backdrop-filter:blur(12px);background:#0c122c80;flex-direction:column;flex:none;gap:12px;width:310px;padding:14px;display:flex;position:relative;overflow:auto}.Hm-TGG_fold{align-self:flex-end}.Hm-TGG_unfold{border:0;border-left:1px solid var(--vy-line);width:28px;color:var(--vy-dim);font:inherit;cursor:pointer;background:#0c122c80;flex:none;position:relative}.Hm-TGG_widget{border:1px solid var(--vy-line);border-radius:14px;flex-direction:column;gap:8px;padding:14px;display:flex}.Hm-TGG_step{border:1px solid var(--vy-line);border-radius:12px;align-items:flex-start;gap:10px;padding:8px 10px;display:flex}.Hm-TGG_tick,.Hm-TGG_tickOn{border:2px solid var(--vy-dim);color:#0000;cursor:pointer;background:0 0;border-radius:50%;flex:none;place-items:center;width:22px;height:22px;margin-top:2px;padding:0;font-size:12px;display:grid}.Hm-TGG_tick:disabled{opacity:.4;cursor:default}.Hm-TGG_tickOn{border-color:var(--vy-fire);color:#2a2340;background:var(--vy-fire)}.Hm-TGG_stepBody{flex-direction:column;flex:1;min-width:0;display:flex}.Hm-TGG_kind{color:var(--vy-dim);font-size:12px;font-weight:600}.Hm-TGG_stepInput,.Hm-TGG_stepInputDone{width:100%;color:var(--vy-ink);font:inherit;background:0 0;border:0;border-bottom:1px solid #0000;padding:2px 0}.Hm-TGG_stepInput:focus,.Hm-TGG_stepInputDone:focus{border-bottom-color:var(--vy-tide);outline:none}.Hm-TGG_stepInput::placeholder{color:var(--vy-dim);opacity:.7}.Hm-TGG_captureInput::placeholder{color:var(--dsw-alias-label-secondary);opacity:.8}.Hm-TGG_stepInputDone{color:var(--vy-dim);text-decoration:line-through}.Hm-TGG_capture{width:100%;color:var(--vy-fire);font:inherit;text-align:left;cursor:pointer;background:#ffd27a1f;border:1px solid #ffd27a80;border-radius:12px;padding:10px 12px;font-weight:600}.Hm-TGG_peek{color:var(--vy-dim);text-overflow:ellipsis;white-space:nowrap;margin:0;font-size:13px;overflow:hidden}.Hm-TGG_tab:focus-visible,.Hm-TGG_tabOn:focus-visible,.Hm-TGG_sort:focus-visible,.Hm-TGG_rowDone:focus-visible,.Hm-TGG_fold:focus-visible,.Hm-TGG_unfold:focus-visible,.Hm-TGG_tick:focus-visible,.Hm-TGG_tickOn:focus-visible,.Hm-TGG_capture:focus-visible{outline:2px solid var(--vy-fire);outline-offset:2px}.Hm-TGG_captureVeil{z-index:1000;pointer-events:auto;background:#141c3e47;place-items:start center;padding:18vh 20px 0;display:grid;position:fixed;inset:0}.Hm-TGG_captureBox{border:1px solid var(--dsw-alias-border-l2);width:min(520px,100%);color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-layer-1);border-radius:16px;flex-direction:column;gap:10px;padding:18px;font-size:14px;display:flex;box-shadow:0 20px 60px #141c3e40}.Hm-TGG_captureBox .Hm-TGG_small{color:var(--dsw-alias-label-secondary)}.Hm-TGG_captureInput{border:1px solid var(--dsw-alias-border-l2);width:100%;color:inherit;background:var(--dsw-alias-bg-base);font:inherit;border-radius:12px;padding:12px 14px;font-size:17px}.Hm-TGG_captureInput:focus{border-color:var(--dsw-alias-brand-primary);outline:none}.Hm-TGG_captureNote{z-index:1000;border:1px solid var(--dsw-alias-border-l2);color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-layer-1);white-space:nowrap;pointer-events:none;border-radius:999px;padding:8px 16px;font-size:14px;font-weight:600;position:fixed;bottom:48px;left:50%;transform:translate(-50%);box-shadow:0 8px 24px #141c3e2e}@container (width<=700px){.Hm-TGG_side{width:240px}}.Hm-TGG_brandName{letter-spacing:.02em;font-size:15px;font-weight:600}";
		const tagId = "dsh-voyage/Voyage.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-voyage";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var Voyage_module_css_default = {
			"brandName": "Hm-TGG_brandName",
			"capture": "Hm-TGG_capture",
			"captureBox": "Hm-TGG_captureBox",
			"captureInput": "Hm-TGG_captureInput",
			"captureNote": "Hm-TGG_captureNote",
			"captureVeil": "Hm-TGG_captureVeil",
			"column": "Hm-TGG_column",
			"error": "Hm-TGG_error",
			"fold": "Hm-TGG_fold",
			"group": "Hm-TGG_group",
			"groupName": "Hm-TGG_groupName",
			"head": "Hm-TGG_head",
			"kind": "Hm-TGG_kind",
			"next": "Hm-TGG_next",
			"page": "Hm-TGG_page",
			"peek": "Hm-TGG_peek",
			"row": "Hm-TGG_row",
			"rowDone": "Hm-TGG_rowDone",
			"rowText": "Hm-TGG_rowText",
			"scene": "Hm-TGG_scene",
			"side": "Hm-TGG_side",
			"small": "Hm-TGG_small",
			"sort": "Hm-TGG_sort",
			"stage": "Hm-TGG_stage",
			"step": "Hm-TGG_step",
			"stepBody": "Hm-TGG_stepBody",
			"stepInput": "Hm-TGG_stepInput",
			"stepInputDone": "Hm-TGG_stepInputDone",
			"tab": "Hm-TGG_tab",
			"tabOn": "Hm-TGG_tabOn",
			"tabs": "Hm-TGG_tabs",
			"tick": "Hm-TGG_tick",
			"tickOn": "Hm-TGG_tickOn",
			"title": "Hm-TGG_title",
			"unfold": "Hm-TGG_unfold",
			"widget": "Hm-TGG_widget"
		};
		//#endregion
		//#region src/client/Brand.tsx
		function Mark({ size, className }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
				className,
				width: size,
				height: size,
				viewBox: "0 0 24 24",
				fill: "none",
				"aria-hidden": "true",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
						cx: "12",
						cy: "9",
						r: "5",
						fill: "#f0c36d"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
						d: "M2.500 17c2.400-1.600 4.700-1.600 7.100 0s4.700 1.600 7.100 0 3.200-1.300 4.800-.6",
						stroke: "#4f8fa8",
						strokeWidth: "1.600",
						strokeLinecap: "round"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
						d: "M4.500 20.500c1.900-1.200 3.800-1.200 5.700 0s3.800 1.200 5.700 0",
						stroke: "#4f8fa8",
						strokeWidth: "1.600",
						strokeLinecap: "round",
						opacity: "0.6"
					})
				]
			});
		}
		/**
		* Render the moon-over-water mark at the size the sidebar asks for.
		* @param props - the sidebar's share: the requested edge.
		* @returns decorative mark.
		*/
		function BrandMark({ size }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Mark, { size });
		}
		/**
		* Render the same mark before the New Session headline.
		* @param props - the headline's share: the requested edge and the class that keeps the mark's place in the row.
		* @returns decorative mark.
		*/
		function HeroMark({ size, className }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Mark, {
				size,
				className
			});
		}
		/**
		* Render the product name beside the mark.
		* @returns the name.
		*/
		function BrandName(_props) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
				className: Voyage_module_css_default.brandName,
				children: "Deep Sea"
			});
		}
		//#endregion
		//#region src/client/capture.ts
		/** Open and close signal for the capture box, shared by the shortcut, the side-panel button and the box. */
		let open = false;
		const listeners$1 = /* @__PURE__ */ new Set();
		/**
		* Show or hide the capture box.
		* @param next - whether the box is open.
		*/
		function setCaptureOpen(next) {
			if (open === next) return;
			open = next;
			for (const listener of listeners$1) listener();
		}
		const subscribe$1 = (listener) => {
			listeners$1.add(listener);
			return () => listeners$1.delete(listener);
		};
		/**
		* Subscribe a component to the capture box state.
		* @returns whether the box is open.
		*/
		function useCaptureOpen() {
			return (0, react.useSyncExternalStore)(subscribe$1, () => open);
		}
		//#endregion
		//#region src/shared.ts
		/** Document-relative form of the state route, so deployment prefixes keep working. */
		const VOYAGE_STATE_ROUTE = "voyage/state";
		/** Document-relative form of the day route. */
		const VOYAGE_DAY_ROUTE = "voyage/day";
		/** Document-relative form of the thought route. */
		const VOYAGE_THOUGHT_ROUTE = "voyage/thought";
		/** Document-relative form of the sort route. */
		const VOYAGE_SORT_ROUTE = "voyage/sort";
		//#endregion
		//#region src/client/data.ts
		/**
		* Browser copy of the voyage data, shared by the page, the side panel and the
		* capture box. Every change is sent to the Host and the Host's answer replaces
		* the copy, so all three always show what was saved.
		*/
		let view = {
			state: void 0,
			error: "",
			sorting: false
		};
		const listeners = /* @__PURE__ */ new Set();
		function set(patch) {
			view = {
				...view,
				...patch
			};
			for (const listener of listeners) listener();
		}
		/** Today's local calendar date as `YYYY-MM-DD`. */
		function today() {
			const now = /* @__PURE__ */ new Date();
			const pad = (value) => String(value).padStart(2, "0");
			return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
		}
		async function send(route, method, body) {
			try {
				const response = await fetch(body === void 0 ? `${route}?date=${today()}` : route, {
					method,
					headers: {
						accept: "application/json",
						...body === void 0 ? {} : { "content-type": "application/json" }
					},
					...body === void 0 ? {} : { body: JSON.stringify({
						date: today(),
						...body
					}) }
				});
				const payload = await response.json();
				if (!response.ok) throw new Error(payload.error ?? `HTTP ${response.status}`);
				set({
					state: payload,
					error: ""
				});
				return true;
			} catch (error) {
				set({ error: error instanceof Error ? error.message : String(error) });
				return false;
			}
		}
		/** Load today's steps and every thought. */
		function loadVoyage() {
			return send(VOYAGE_STATE_ROUTE, "GET");
		}
		/**
		* Replace today's steps. The copy changes at once so typing and ticking feel immediate; a failed save shows the error.
		* @param steps - all three steps.
		*/
		function saveSteps(steps) {
			if (view.state !== void 0) set({ state: {
				...view.state,
				day: {
					...view.state.day,
					steps
				}
			} });
			return send(VOYAGE_DAY_ROUTE, "PUT", { steps });
		}
		/**
		* File one captured thought.
		* @param text - the thought.
		* @returns whether it was saved.
		*/
		function captureThought(text) {
			return send(VOYAGE_THOUGHT_ROUTE, "POST", { text });
		}
		/**
		* Mark a thought done or bring it back.
		* @param id - thought id.
		* @param done - new state.
		*/
		function setThoughtDone(id, done) {
			return send(VOYAGE_THOUGHT_ROUTE, "PUT", {
				id,
				done
			});
		}
		/** Ask the model to group the open thoughts. */
		async function sortThoughts() {
			set({ sorting: true });
			const ok = await send(VOYAGE_SORT_ROUTE, "POST", {});
			set({ sorting: false });
			return ok;
		}
		const subscribe = (listener) => {
			listeners.add(listener);
			return () => listeners.delete(listener);
		};
		/**
		* Subscribe a component to the shared copy.
		* @returns the current view.
		*/
		function useVoyage() {
			return (0, react.useSyncExternalStore)(subscribe, () => view);
		}
		//#endregion
		//#region src/client/CaptureBox.tsx
		/** The capture box: one line, filed to Waiting, shown over whatever page is open. */
		/** How long the "filed" note stays, in milliseconds. */
		const NOTE_MS = 2200;
		/**
		* Render the capture box and its confirmation note into the document body.
		* @param props - the overlay slot's runtime share and this plugin's translator.
		* @returns a portal, or nothing while the box is closed and no note is showing.
		*/
		function CaptureBox({ t }) {
			const open = useCaptureOpen();
			const [text, setText] = (0, react.useState)("");
			const [note, setNote] = (0, react.useState)("");
			const input = (0, react.useRef)(null);
			const before = (0, react.useRef)(null);
			(0, react.useEffect)(() => {
				if (!open) return;
				before.current = document.activeElement;
				input.current?.focus();
				return () => {
					if (before.current instanceof HTMLElement) before.current.focus();
				};
			}, [open]);
			(0, react.useEffect)(() => {
				if (note === "") return;
				const timer = window.setTimeout(() => {
					setNote("");
				}, NOTE_MS);
				return () => {
					window.clearTimeout(timer);
				};
			}, [note]);
			const submit = (event) => {
				event.preventDefault();
				const thought = text.trim();
				if (thought === "") {
					setCaptureOpen(false);
					return;
				}
				captureThought(thought).then((saved) => {
					if (!saved) return;
					setText("");
					setCaptureOpen(false);
					setNote(t("capture.filed"));
				});
			};
			if (!open && note === "") return null;
			return (0, react_dom.createPortal)(/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [open && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: Voyage_module_css_default.captureVeil,
				onMouseDown: (event) => {
					if (event.target === event.currentTarget) setCaptureOpen(false);
				},
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("form", {
					className: Voyage_module_css_default.captureBox,
					onSubmit: submit,
					onKeyDown: (event) => {
						if (event.key === "Escape") setCaptureOpen(false);
					},
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("label", {
							className: Voyage_module_css_default.small,
							htmlFor: "voyage-capture",
							children: t("capture.title")
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
							id: "voyage-capture",
							ref: input,
							className: Voyage_module_css_default.captureInput,
							value: text,
							placeholder: t("capture.placeholder"),
							autoComplete: "off",
							onChange: (event) => {
								setText(event.target.value);
							}
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: Voyage_module_css_default.small,
							children: t("capture.keys")
						})
					]
				})
			}), note !== "" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: Voyage_module_css_default.captureNote,
				role: "status",
				children: note
			})] }), document.body);
		}
		//#endregion
		//#region src/client/locales.ts
		/** Web dictionaries for the voyage pages and the capture box. */
		/** Locale namespace owned by this plugin. */
		const NS = "voyage";
		/** English dictionary and key source. */
		const en = {
			panel: "Today",
			"tab.home": "Home",
			"tab.waiting": "Waiting · {count}",
			"course.title": "Today's course",
			"course.deepSea": "Deep sea",
			"course.boat": "Boat",
			"course.fire": "Fire",
			"course.deepSea.hint": "One step toward the mission",
			"course.boat.hint": "One thing that keeps life steady",
			"course.fire.hint": "One thing that gives energy back",
			"course.tick": "Mark \"{kind}\" done",
			"next.label": "Next step · {kind}",
			"next.unset": "Write today's first step in the panel on the right.",
			"next.allDone": "You brought the fire back.",
			"next.today": "Today",
			"side.hide": "Hide",
			"side.show": "Show today's course",
			"capture.button": "Capture a thought",
			"capture.count": "{count} waiting",
			"capture.title": "Capture · it is filed to Waiting and you stay where you are",
			"capture.placeholder": "What just came to mind?",
			"capture.keys": "Enter files it · Esc closes",
			"capture.filed": "Filed. Back to what you were doing.",
			"capture.command": "Capture a thought",
			"waiting.title": "Waiting",
			"waiting.lead": "Thoughts you captured. Nothing here needs you until you open it.",
			"waiting.sort": "Sort with AI",
			"waiting.sorting": "Sorting…",
			"waiting.empty": "Nothing is waiting.",
			"waiting.done": "Done",
			"waiting.unsorted": "Not sorted yet",
			loading: "Loading…",
			failed: "That did not work: {message}"
		};
		/** Simplified Chinese dictionary checked against the English key set. */
		const zh = {
			panel: "今天",
			"tab.home": "主页",
			"tab.waiting": "停靠 · {count}",
			"course.title": "今日航线",
			"course.deepSea": "往深海走一步",
			"course.boat": "稳住船",
			"course.fire": "带着火回来",
			"course.deepSea.hint": "朝主线目标走的一步",
			"course.boat.hint": "让生活保持平稳的一件事",
			"course.fire.hint": "能恢复能量的一件事",
			"course.tick": "把“{kind}”标为完成",
			"next.label": "下一步 · {kind}",
			"next.unset": "在右侧面板写下今天的第一步。",
			"next.allDone": "你把火带回来了。",
			"next.today": "今天",
			"side.hide": "收起",
			"side.show": "显示今日航线",
			"capture.button": "记下一个想法",
			"capture.count": "已停靠 {count} 件",
			"capture.title": "记一下 · 它会被放进“停靠”，你留在原处",
			"capture.placeholder": "刚才想到了什么？",
			"capture.keys": "回车存入 · Esc 关闭",
			"capture.filed": "已存入。回到你刚才在做的事。",
			"capture.command": "记下一个想法",
			"waiting.title": "停靠",
			"waiting.lead": "你记下的想法。在你打开之前，这里什么都不需要你处理。",
			"waiting.sort": "用 AI 整理",
			"waiting.sorting": "正在整理…",
			"waiting.empty": "没有停靠的想法。",
			"waiting.done": "完成",
			"waiting.unsorted": "尚未整理",
			loading: "正在加载…",
			failed: "操作未成功：{message}"
		};
		//#endregion
		//#region src/client/VoyageIcon.tsx
		/**
		* Render a small sailing-boat glyph at the size the sidebar asks for; the sidebar owns the label.
		* @param props - the sidebar's icon share: the requested edge.
		* @returns decorative icon.
		*/
		function VoyageIcon({ size }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
				width: size,
				height: size,
				viewBox: "0 0 20 20",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: "1.5",
				strokeLinecap: "round",
				strokeLinejoin: "round",
				"aria-hidden": "true",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M10 3v10M10 4.5c3 1.500 4.500 4 4.800 7.500H10M8.500 6.500 6 12h2.500" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M3.500 14.500h13l-1.800 2.500H5.300z" })]
			});
		}
		//#endregion
		//#region src/client/paint.ts
		/**
		* Canvas painting for the night-sea scenes. Every function draws into a
		* 1280 by 800 coordinate space; the canvas element scales that to its box.
		*/
		/** Scene width in canvas units. */
		const W = 1280;
		/** Fixed pseudo-random triples so stars and sparks keep their places between frames. */
		const R = Array.from({ length: 120 }, (_, index) => {
			const at = (salt) => {
				const value = Math.sin((index + 1) * 12.9898 + salt * 78.233) * 43758.5453;
				return value - Math.floor(value);
			};
			return {
				a: at(1),
				b: at(2),
				c: at(3)
			};
		});
		function sky(g, stops, y0, y1) {
			const gradient = g.createLinearGradient(0, y0, 0, y1);
			for (const [offset, color] of stops) gradient.addColorStop(offset, color);
			g.fillStyle = gradient;
			g.fillRect(0, y0, W, y1 - y0);
		}
		function glow(g, x, y, r, rgb, alpha) {
			const gradient = g.createRadialGradient(x, y, 0, x, y, r);
			gradient.addColorStop(0, `rgba(${rgb},${alpha})`);
			gradient.addColorStop(1, `rgba(${rgb},0)`);
			g.fillStyle = gradient;
			g.fillRect(x - r, y - r, 2 * r, 2 * r);
		}
		const waveY = (y, amp, f, phase, x) => y - (Math.sin(x * f + phase) + .45 * Math.sin(x * f * 2.3 + phase * 1.7 + 1)) * amp;
		function ridge(g, y, amp, f, phase, fill, crest) {
			g.beginPath();
			g.moveTo(0, 800);
			for (let x = 0; x <= W; x += 12) g.lineTo(x, waveY(y, amp, f, phase, x));
			g.lineTo(W, 800);
			g.closePath();
			g.fillStyle = fill;
			g.fill();
			if (crest <= 0) return;
			g.strokeStyle = `rgba(140,255,240,${crest})`;
			g.lineWidth = 2.5;
			g.beginPath();
			for (let x = 0; x <= W; x += 12) g.lineTo(x, waveY(y, amp, f, phase, x));
			g.stroke();
		}
		function disc(g, x, y, rx, fill, ry = rx) {
			g.fillStyle = fill;
			g.beginPath();
			g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
			g.fill();
		}
		function poly(g, points, fill) {
			g.fillStyle = fill;
			g.beginPath();
			points.forEach(([x, y], index) => index === 0 ? g.moveTo(x, y) : g.lineTo(x, y));
			g.closePath();
			g.fill();
		}
		function stroke(g, points, color, width) {
			g.strokeStyle = color;
			g.lineWidth = width;
			g.lineCap = "round";
			g.beginPath();
			points.forEach(([x, y], index) => index === 0 ? g.moveTo(x, y) : g.lineTo(x, y));
			g.stroke();
		}
		function stars(g, t, count, maxY) {
			for (let index = 0; index < count; index += 1) {
				const r = R[index % R.length];
				disc(g, r.a * W, r.b * maxY, .8 + r.c * 1.5, `rgba(255,255,255,${.4 + .5 * Math.sin(t * (1 + r.c * 2) + index)})`);
			}
		}
		function lighthouse(g, t, x, y, light) {
			disc(g, x, y + 14, 90, "#2c2f63", 26);
			poly(g, [
				[x - 16, y],
				[x + 16, y],
				[x + 10, y - 120],
				[x - 10, y - 120]
			], "#f3efff");
			poly(g, [
				[x - 14, y - 44],
				[x + 14, y - 44],
				[x + 12, y - 70],
				[x - 12, y - 70]
			], "#e9765b");
			poly(g, [
				[x - 13, y - 120],
				[x + 13, y - 120],
				[x + 13, y - 142],
				[x - 13, y - 142]
			], "#2a2a55");
			poly(g, [
				[x - 16, y - 142],
				[x + 16, y - 142],
				[x, y - 160]
			], "#e9765b");
			glow(g, x, y - 131, 60 + 240 * light, "255,222,140", .35 + .6 * light);
			disc(g, x, y - 131, 8, light > .05 ? "#fff0b8" : "#9a9ac4");
			if (light < .98) return;
			const reach = 620 * Math.abs(Math.cos(t * .5)) + 80;
			g.save();
			g.globalAlpha = .2;
			poly(g, [
				[x, y - 131],
				[x - reach, y - 190],
				[x - reach, y - 60]
			], "#fff0b8");
			g.restore();
		}
		function boat(g, x, y, tilt) {
			g.save();
			g.translate(x, y);
			g.rotate(tilt);
			g.fillStyle = "#e9a45c";
			g.beginPath();
			g.moveTo(-48, -8);
			g.quadraticCurveTo(0, 28, 52, -8);
			g.closePath();
			g.fill();
			stroke(g, [[0, -6], [0, -80]], "#4a3b36", 3);
			g.fillStyle = "#f3f0ff";
			g.beginPath();
			g.moveTo(5, -78);
			g.quadraticCurveTo(46, -46, 40, -14);
			g.lineTo(5, -14);
			g.closePath();
			g.fill();
			poly(g, [
				[-5, -68],
				[-30, -14],
				[-5, -14]
			], "#f3f0ff");
			glow(g, 50, -22, 90, "255,210,120", .85);
			disc(g, 50, -20, 6, "#ffd27a");
			g.restore();
		}
		const WAVE_FILLS = [
			"rgba(50,110,160,.6)",
			"rgba(40,98,150,.75)",
			"rgba(30,86,138,.85)",
			"rgba(24,74,124,.92)",
			"#143f6c"
		];
		/**
		* Paint the glowing night sea.
		* @param g - canvas context.
		* @param t - animation time in seconds.
		* @param o - horizon, moon, and what floats on the water.
		*/
		function paintSea(g, t, o) {
			const hz = o.horizon;
			sky(g, [
				[0, "#1d2c66"],
				[.6, "#4257a8"],
				[1, "#8f8fdc"]
			], 0, 800 * hz);
			stars(g, t, o.stars, 800 * hz * .9);
			const [mx, my, mr] = o.moon;
			glow(g, W * mx, 800 * my, mr * 6, "225,232,255", .8);
			disc(g, W * mx, 800 * my, mr, "#fbfbff");
			ridge(g, 800 * hz - 4, 22, .004, 1, "#3d4a94", 0);
			ridge(g, 800 * hz + 4, 13, .007, 4, "#2f3a7c", 0);
			sky(g, [
				[0, "#6f79cf"],
				[.3, "#285f95"],
				[1, "#123a66"]
			], 800 * hz + 4, 800);
			for (let index = 0; index < 14; index += 1) {
				const y = 800 * hz + 16 + index * 13;
				const half = 50 + index * 9 + Math.sin(t * 1.4 + index) * 22;
				if (y < 800) stroke(g, [[W * mx - half, y], [W * mx + half, y]], `rgba(225,232,255,${.42 - index * .028})`, 4);
			}
			if (o.light !== void 0) lighthouse(g, t, W * .86, 800 * (hz + .05), o.light);
			const gap = (1 - hz) * .19;
			for (let k = 0; k < 5; k += 1) {
				const y = 800 * (hz + gap * (k + 1));
				const amp = 6 + 3 * k;
				const f = .011 - .001 * k;
				const phase = t * (.6 + .15 * k) + k * 2;
				if (o.boatX !== void 0 && k === 2) {
					const slope = (waveY(y, amp, f, phase, o.boatX + 30) - waveY(y, amp, f, phase, o.boatX - 30)) / 60;
					boat(g, o.boatX, waveY(y, amp, f, phase, o.boatX) - 6, slope * .7);
				}
				for (let index = 0; index < (o.lanterns ?? 0); index += 1) {
					if (index % 4 !== k) continue;
					const x = W * (.1 + .8 * ((index * .618 + .13) % 1));
					const ly = waveY(y, amp, f, phase, x) - 10;
					glow(g, x, ly, 90, "255,206,120", .8);
					poly(g, [
						[x - 9, ly - 14],
						[x + 9, ly - 14],
						[x + 11, ly + 8],
						[x - 11, ly + 8]
					], "#ffd27a");
					poly(g, [
						[x - 11, ly + 6],
						[x + 11, ly + 6],
						[x + 8, ly + 12],
						[x - 8, ly + 12]
					], "#7a5540");
				}
				ridge(g, y, amp, f, phase, WAVE_FILLS[k], .5 + .3 * Math.sin(t + k));
			}
			const span = 800 * (1 - hz + .2);
			for (let index = 0; index < 34; index += 1) {
				const r = R[index + 70];
				const y = 800 - (r.b * span + t * (5 + r.c * 12)) % span;
				glow(g, r.a * W + Math.sin(t * (.4 + r.c) + index) * 26, y, 5 + r.c * 5, "170,255,220", .5 + .4 * Math.sin(t * 1.5 + index));
			}
			vignette(g);
		}
		/**
		* Paint dark still water with slow ripples.
		* @param g - canvas context.
		* @param t - animation time in seconds.
		*/
		function paintStillWater(g, t) {
			sky(g, [
				[0, "#0e1536"],
				[.7, "#16214e"],
				[1, "#1b2a5c"]
			], 0, 800);
			stars(g, t, 40, 800 * .5);
			glow(g, W * .5, -60, 520, "200,212,255", .3);
			for (let index = 0; index < 5; index += 1) {
				const r = (t * 16 + index * 96) % 480;
				g.strokeStyle = `rgba(140,255,240,${.3 * (1 - r / 480)})`;
				g.lineWidth = 2;
				g.beginPath();
				g.ellipse(W * .5, 800 * .93, r * 1.6, r * .22, 0, 0, Math.PI * 2);
				g.stroke();
			}
			glow(g, W * .5, 800 * .93, 90, "225,232,255", .35);
			vignette(g);
		}
		function vignette(g) {
			const gradient = g.createRadialGradient(W / 2, 800 / 2, 800 * .5, W / 2, 800 / 2, 800);
			gradient.addColorStop(0, "rgba(10,10,40,0)");
			gradient.addColorStop(1, "rgba(10,10,40,.3)");
			g.fillStyle = gradient;
			g.fillRect(0, 0, W, 800);
		}
		//#endregion
		//#region src/client/Scene.tsx
		/** The animated night-sea canvas behind a voyage page. */
		/**
		* Paint one scene and keep it moving while the page is visible.
		* @param props - `kind` picks the scene, `progress` is the number of finished steps (0 to 3), `lanterns` the number of open thoughts.
		* @returns a canvas that fills its positioned parent.
		*/
		function Scene({ kind, progress, lanterns }) {
			const canvas = (0, react.useRef)(null);
			const latest = (0, react.useRef)({
				kind,
				progress,
				lanterns
			});
			latest.current = {
				kind,
				progress,
				lanterns
			};
			(0, react.useEffect)(() => {
				const g = canvas.current?.getContext("2d");
				if (g === null || g === void 0) return;
				const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
				let frame = 0;
				let t = 0;
				let shown = latest.current.progress;
				const draw = () => {
					const now = latest.current;
					shown += still ? now.progress - shown : (now.progress - shown) * .035;
					if (now.kind === "still") paintStillWater(g, t);
					else {
						const options = now.kind === "home" ? {
							horizon: .58,
							moon: [
								.5,
								.3,
								70
							],
							stars: 70,
							boatX: W * (.3 + .1 * shown),
							light: Math.min(1, shown / 3)
						} : {
							horizon: .62,
							moon: [
								.7,
								.2,
								46
							],
							stars: 70,
							lanterns: now.lanterns
						};
						paintSea(g, t, options);
					}
					t += 1 / 60;
					frame = still ? 0 : requestAnimationFrame(draw);
				};
				const start = () => {
					cancelAnimationFrame(frame);
					if (document.visibilityState === "visible") draw();
				};
				start();
				document.addEventListener("visibilitychange", start);
				const redraw = still ? window.setInterval(draw, 1e3) : 0;
				return () => {
					cancelAnimationFrame(frame);
					window.clearInterval(redraw);
					document.removeEventListener("visibilitychange", start);
				};
			}, []);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("canvas", {
				ref: canvas,
				className: Voyage_module_css_default.scene,
				width: W,
				height: 800,
				"aria-hidden": "true"
			});
		}
		//#endregion
		//#region src/client/VoyagePage.tsx
		/**
		* The voyage page: a night-sea scene with today's next step, the Waiting
		* list of captured thoughts, and a side panel holding the day's three steps.
		*/
		const KINDS = [
			"deepSea",
			"boat",
			"fire"
		];
		/** Typing pauses this long before the steps are saved, in milliseconds. */
		const SAVE_DELAY_MS = 700;
		const SIDE_KEY = "voyage:side";
		const EMPTY_STEPS = Array.from({ length: 3 }, () => ({
			text: "",
			done: false
		}));
		function rememberedSide() {
			try {
				return localStorage.getItem(SIDE_KEY) !== "shut";
			} catch (error) {
				return true;
			}
		}
		function SidePanel({ t, steps, waiting, latest, onSteps, onHide }) {
			const change = (index, patch, now) => {
				onSteps(steps.map((step, at) => at === index ? {
					...step,
					...patch
				} : step), now);
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("aside", {
				className: Voyage_module_css_default.side,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
						type: "button",
						className: Voyage_module_css_default.fold,
						onClick: onHide,
						children: [t("side.hide"), " ›"]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
						className: Voyage_module_css_default.widget,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: Voyage_module_css_default.small,
								children: (/* @__PURE__ */ new Date()).toLocaleDateString(void 0, {
									weekday: "long",
									day: "numeric",
									month: "long"
								})
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", {
								className: Voyage_module_css_default.title,
								children: t("course.title")
							}),
							KINDS.map((kind, index) => {
								const step = steps[index] ?? {
									text: "",
									done: false
								};
								return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: Voyage_module_css_default.step,
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: step.done ? Voyage_module_css_default.tickOn : Voyage_module_css_default.tick,
										"aria-pressed": step.done,
										"aria-label": t("course.tick", { kind: t(`course.${kind}`) }),
										disabled: step.text.trim() === "",
										onClick: () => {
											change(index, { done: !step.done }, true);
										},
										children: "✓"
									}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
										className: Voyage_module_css_default.stepBody,
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
											className: Voyage_module_css_default.kind,
											children: t(`course.${kind}`)
										}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
											className: step.done ? Voyage_module_css_default.stepInputDone : Voyage_module_css_default.stepInput,
											value: step.text,
											placeholder: t(`course.${kind}.hint`),
											onChange: (event) => {
												change(index, { text: event.target.value }, false);
											}
										})]
									})]
								}, kind);
							})
						]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
						className: Voyage_module_css_default.widget,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: Voyage_module_css_default.capture,
								onClick: () => {
									setCaptureOpen(true);
								},
								children: t("capture.button")
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: Voyage_module_css_default.small,
								children: t("capture.count", { count: waiting })
							}),
							latest.map((thought) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
								className: Voyage_module_css_default.peek,
								children: thought.text
							}, thought.id))
						]
					})
				]
			});
		}
		function Waiting({ t, open, groups, sorting }) {
			const row = (thought) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: Voyage_module_css_default.row,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					className: Voyage_module_css_default.rowText,
					children: thought.text
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
					type: "button",
					className: Voyage_module_css_default.rowDone,
					onClick: () => {
						setThoughtDone(thought.id, true);
					},
					children: t("waiting.done")
				})]
			}, thought.id);
			const sorted = open.some((thought) => thought.group !== "");
			const unsorted = open.filter((thought) => !groups.includes(thought.group));
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: Voyage_module_css_default.column,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: Voyage_module_css_default.head,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", {
							className: Voyage_module_css_default.title,
							children: t("waiting.title")
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: Voyage_module_css_default.small,
							children: t("waiting.lead")
						})] }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: Voyage_module_css_default.sort,
							disabled: sorting || open.length === 0,
							onClick: () => {
								sortThoughts();
							},
							children: sorting ? t("waiting.sorting") : t("waiting.sort")
						})]
					}),
					open.length === 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: Voyage_module_css_default.small,
						children: t("waiting.empty")
					}),
					!sorted && open.map(row),
					sorted && groups.map((group) => {
						const members = open.filter((thought) => thought.group === group);
						return members.length === 0 ? null : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
							className: Voyage_module_css_default.group,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("h3", {
								className: Voyage_module_css_default.groupName,
								children: [
									group,
									" · ",
									members.length
								]
							}), members.map(row)]
						}, group);
					}),
					sorted && unsorted.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
						className: Voyage_module_css_default.group,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("h3", {
							className: Voyage_module_css_default.groupName,
							children: [
								t("waiting.unsorted"),
								" · ",
								unsorted.length
							]
						}), unsorted.map(row)]
					})
				]
			});
		}
		/**
		* Render the voyage page.
		* @param props - the main slot's runtime share and this plugin's translator.
		* @returns the page.
		*/
		function VoyagePage({ t }) {
			const { state, error, sorting } = useVoyage();
			const [tab, setTab] = (0, react.useState)("home");
			const [side, setSide] = (0, react.useState)(rememberedSide);
			const [steps, setSteps] = (0, react.useState)(void 0);
			const timer = (0, react.useRef)(0);
			(0, react.useEffect)(() => {
				loadVoyage();
			}, []);
			(0, react.useEffect)(() => {
				if (steps === void 0 && state !== void 0) setSteps(state.day.steps);
			}, [state, steps]);
			(0, react.useEffect)(() => () => {
				window.clearTimeout(timer.current);
			}, []);
			const shown = steps ?? EMPTY_STEPS;
			const open = (0, react.useMemo)(() => (state?.thoughts ?? []).filter((thought) => !thought.done), [state]);
			const onSteps = (next, now) => {
				setSteps(next);
				window.clearTimeout(timer.current);
				timer.current = window.setTimeout(() => {
					saveSteps(next);
				}, now ? 0 : SAVE_DELAY_MS);
			};
			const toggleSide = (next) => {
				setSide(next);
				try {
					localStorage.setItem(SIDE_KEY, next ? "open" : "shut");
				} catch (error_) {}
			};
			const written = shown.filter((step) => step.text.trim() !== "");
			const nextIndex = shown.findIndex((step) => step.text.trim() !== "" && !step.done);
			const allDone = written.length === 3 && nextIndex === -1;
			const nextKind = KINDS[nextIndex];
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: Voyage_module_css_default.page,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Scene, {
						kind: tab,
						progress: written.filter((step) => step.done).length,
						lanterns: open.length
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: Voyage_module_css_default.stage,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("nav", {
								className: Voyage_module_css_default.tabs,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: tab === "home" ? Voyage_module_css_default.tabOn : Voyage_module_css_default.tab,
									"aria-current": tab === "home" ? "page" : void 0,
									onClick: () => {
										setTab("home");
									},
									children: t("tab.home")
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: tab === "waiting" ? Voyage_module_css_default.tabOn : Voyage_module_css_default.tab,
									"aria-current": tab === "waiting" ? "page" : void 0,
									onClick: () => {
										setTab("waiting");
									},
									children: t("tab.waiting", { count: open.length })
								})]
							}),
							error !== "" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
								className: Voyage_module_css_default.error,
								role: "alert",
								children: t("failed", { message: error })
							}),
							state === void 0 && error === "" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
								className: Voyage_module_css_default.small,
								children: t("loading")
							}),
							tab === "waiting" && state !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Waiting, {
								t,
								open,
								groups: state.groups,
								sorting
							}),
							tab === "home" && state !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: Voyage_module_css_default.next,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: Voyage_module_css_default.small,
									children: nextKind === void 0 ? t("next.today") : t("next.label", { kind: t(`course.${nextKind}`) })
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", {
									className: Voyage_module_css_default.title,
									children: nextKind === void 0 ? allDone ? t("next.allDone") : t("next.unset") : shown[nextIndex]?.text
								})]
							})
						]
					}),
					side ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(SidePanel, {
						t,
						steps: shown,
						waiting: open.length,
						latest: open.slice(-2).reverse(),
						onSteps,
						onHide: () => {
							toggleSide(false);
						}
					}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: Voyage_module_css_default.unfold,
						"aria-label": t("side.show"),
						title: t("side.show"),
						onClick: () => {
							toggleSide(true);
						},
						children: "‹"
					})
				]
			});
		}
		//#endregion
		//#region src/client/index.ts
		const PANEL_ID = "voyage";
		const THEME_ID = "glow-tide";
		/** Desktop owns Command or Control + L. Web browsers keep that key for the address bar, so Web adds Shift. */
		const DESKTOP_KEY = {
			code: "KeyL",
			modifiers: ["primary"]
		};
		const WEB_KEY = {
			code: "KeyL",
			modifiers: ["primary", "shift"]
		};
		/**
		* Sea-tinted surfaces as `[light value, dark value]`. The light values are pale, low-saturation blue-greys
		* for every page; the dark values are the night-sea surfaces, used only if the dark palette is chosen in settings.
		*/
		const SEA = {
			"--dsw-alias-bg-base": ["#f3f5fa", "#121a40"],
			"--dsw-alias-bg-layer-1": ["#fbfcfe", "#18224f"],
			"--dsw-alias-bg-layer-2": ["#f6f8fc", "#1d2a5e"],
			"--dsw-alias-bg-overlay": ["#e6ebf5", "#1b2658"],
			"--dsw-alias-border-l1": ["rgba(40, 60, 120, 0.08)", "rgba(200, 215, 255, 0.1)"],
			"--dsw-alias-border-l2": ["rgba(40, 60, 120, 0.16)", "rgba(200, 215, 255, 0.18)"],
			"--dsw-alias-brand-primary": ["#24305c", "#f4f6ff"],
			"--dsw-alias-label-primary": ["#1e2742", "#eef2ff"],
			"--dsw-alias-label-secondary": ["#56617e", "#b4bfdf"],
			"--dsw-specific-sidebar-fill": ["#e8edf6", "#0f1638"]
		};
		/**
		* The dark end of the app's neutral scale, as `[built-in value, night-blue value]`. Buttons, inputs and
		* cards take their fills from this scale, so tinting it recolours them without naming each one. The
		* built-in value is kept for the light palette, where these steps are text colours.
		*/
		const NIGHT_NEUTRALS = {
			"--dsw-static-neutral-bluish-1000": ["rgb(15, 17, 21)", "#0b1030"],
			"--dsw-static-neutral-bluish-950": ["rgb(21, 21, 23)", "#101737"],
			"--dsw-static-neutral-bluish-900": ["rgb(27, 27, 28)", "#141c44"],
			"--dsw-static-neutral-bluish-875": ["rgb(35, 35, 36)", "#18224f"],
			"--dsw-static-neutral-bluish-850": ["rgb(44, 44, 46)", "#1d2a5e"],
			"--dsw-static-neutral-bluish-800": ["rgb(53, 54, 56)", "#23316b"],
			"--dsw-static-neutral-bluish-750": ["rgb(67, 69, 74)", "#2b3b7a"],
			"--dsw-static-neutral-bluish-700": ["rgb(97, 102, 107)", "#40508f"]
		};
		/**
		* Language packs that replace the app's own product wording. Each falls back, key by key, to the built-in
		* language it is based on, so only the listed text changes.
		*/
		const PACKS = [{
			id: "en-deepsea",
			base: "en",
			label: "English · Deep Sea",
			common: { "brand.localBuild": "Deep Sea" },
			conversation: {
				"hero.headline": "One step into the deep sea",
				"hero.preview": "today"
			}
		}, {
			id: "zh-deepsea",
			base: "zh",
			label: "中文 · 深海",
			common: { "brand.localBuild": "深海" },
			conversation: {
				"hero.headline": "每天往深海走一步",
				"hero.preview": "今天"
			}
		}];
		/** Required browser services: slots, localized copy, keyboard commands, the panel switcher, and themes. */
		const inject = [
			"slots",
			"locale",
			"shortcuts",
			"layout",
			"theme"
		];
		/** Namespaces whose product wording the language packs replace. */
		const COMMON_NS = "common";
		const CONVERSATION_NS = "conversation";
		/**
		* Register the dictionaries, the theme, the page with its sidebar entry, the sidebar brand, the product wording and welcome mark, and the capture box with its command.
		* @param ctx - browser services used by these contributions.
		*/
		function apply(ctx) {
			ctx.effect(() => ctx.locale.register(NS, {
				zh,
				en
			}), "voyage: dictionaries");
			const t = ctx.locale.bind(NS);
			for (const pack of PACKS) {
				ctx.effect(() => ctx.locale.addLanguage({
					id: pack.id,
					label: pack.label,
					fallback: pack.base
				}), `voyage: ${pack.id} language`);
				ctx.effect(() => ctx.locale.register(COMMON_NS, pack.id, pack.common), `voyage: ${pack.id} product name`);
				ctx.effect(() => ctx.locale.register(CONVERSATION_NS, pack.id, pack.conversation), `voyage: ${pack.id} welcome text`);
			}
			const usePack = (active) => {
				const pack = PACKS.find((candidate) => candidate.base === active);
				if (pack !== void 0) ctx.locale.setLocale(pack.id);
			};
			ctx.on("locale/change", (snapshot) => {
				usePack(snapshot.active);
			});
			usePack(ctx.locale.getLocale().active);
			ctx.effect(() => ctx.theme.overrideTokens(THEME_ID, {
				...Object.fromEntries(Object.entries(NIGHT_NEUTRALS).map(([token, [light, dark]]) => [token, {
					light,
					dark
				}])),
				...Object.fromEntries(Object.entries(SEA).map(([token, [light, dark]]) => [token, {
					light,
					dark
				}]))
			}), "voyage: theme");
			ctx.theme.setTheme("light");
			ctx.effect(() => ctx.slots.inject("main", () => {
				const dispose = ctx.slots.register({
					name: "main",
					key: PANEL_ID,
					locale: NS
				}, VoyagePage);
				ctx.layout.selectPanel(PANEL_ID);
				return dispose;
			}), "voyage: page");
			ctx.effect(() => ctx.slots.inject("sidebar.panellist", () => ctx.slots.register({
				name: "sidebar.panellist",
				id: PANEL_ID,
				order: -3,
				locale: NS,
				label: () => t("panel")
			}, VoyageIcon)), "voyage: sidebar entry");
			ctx.effect(() => ctx.slots.inject("sidebar.brand.mark", () => ctx.slots.register({ name: "sidebar.brand.mark" }, BrandMark)), "voyage: brand mark");
			ctx.effect(() => ctx.slots.inject("sidebar.brand.name", () => ctx.slots.register({ name: "sidebar.brand.name" }, BrandName)), "voyage: brand name");
			ctx.effect(() => ctx.slots.inject("conversation.hero.brand.mark", () => ctx.slots.register({ name: "conversation.hero.brand.mark" }, HeroMark)), "voyage: welcome mark");
			ctx.effect(() => ctx.slots.inject("shell.overlay", () => ctx.slots.register({
				name: "shell.overlay",
				id: "voyage-capture",
				locale: NS
			}, CaptureBox)), "voyage: capture box");
			ctx.effect(() => ctx.shortcuts.register({
				id: "voyage.capture",
				label: () => t("capture.command"),
				aliases: [
					"capture a thought",
					"park a thought",
					"quick note"
				],
				defaults: {
					"desktop:macos": DESKTOP_KEY,
					"desktop:windows": DESKTOP_KEY,
					"desktop:linux": DESKTOP_KEY,
					"web:macos": WEB_KEY,
					"web:windows": WEB_KEY
				},
				regions: [
					"page",
					"editable",
					"terminal"
				],
				modals: [],
				resolve: () => ({
					status: "handled",
					run: () => {
						setCaptureOpen(true);
					}
				})
			}), "voyage: capture command");
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

