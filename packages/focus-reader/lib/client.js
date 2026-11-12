window.__ModuleLoader__.load({
	id: "dsh-focus-reader",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react_jsx_runtime = require("react/jsx-runtime");
		let react = require("react");
		//#region src/client/ReaderIcon.tsx
		/**
		* Render an open-book glyph at the size the sidebar asks for; the sidebar owns the label.
		* @param props - the sidebar's icon share: the requested edge.
		* @returns decorative icon.
		*/
		function ReaderIcon({ size }) {
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
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M10 5.2C8.4 4 6.2 3.6 3.5 3.8v10.6c2.700-.2 4.900.2 6.500 1.400 1.600-1.200 3.800-1.600 6.500-1.400V3.800C13.800 3.600 11.600 4 10 5.200Z" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M10 5.200v10.600" })]
			});
		}
		//#endregion
		//#region src/shared.ts
		/** Document-relative form of the list route, so deployment prefixes keep working. */
		const READER_DOCS_ROUTE = "focus-reader/docs";
		/** Document-relative form of the document route. */
		const READER_DOC_ROUTE = "focus-reader/doc";
		/** Document-relative form of the notes route. */
		const READER_NOTES_ROUTE = "focus-reader/notes";
		/** Document-relative form of the ask route. */
		const READER_ASK_ROUTE = "focus-reader/ask";
		//#endregion
		//#region \0dsh-css:./src/client/ReaderPage.module.css.mjs
		const css = ".xJC7vG_page{--fr-ai:var(--dsw-alias-state-business-primary);--fr-ai-soft:color-mix(in srgb, var(--dsw-alias-state-business-primary) 14%, transparent);--fr-hl:#ffd03c80;--fr-read:\"Source Serif 4\", \"Iowan Old Style\", Georgia, \"Songti SC\", serif;--fr-mono:ui-monospace, \"SF Mono\", Menlo, monospace;scrollbar-gutter:stable;width:100%;min-width:0;height:100%;min-height:0;color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-base);padding:0 16px 96px;font-size:14px;line-height:1.5;overflow:auto}.xJC7vG_bar{z-index:3;background:var(--dsw-alias-bg-base);flex-wrap:wrap;align-items:center;gap:8px 16px;max-width:1180px;margin:0 auto;padding:10px 0;display:flex;position:sticky;top:0}.xJC7vG_select{border:1px solid var(--dsw-alias-border-l2);border-radius:var(--dsw-radius-md);min-width:0;color:inherit;background:var(--dsw-alias-bg-layer-1);font:inherit;flex:0 420px;padding:6px 8px}.xJC7vG_toggle{color:var(--dsw-alias-label-secondary);align-items:center;gap:6px;display:flex}.xJC7vG_grid,.xJC7vG_gridLane{grid-template-columns:minmax(0,760px);justify-content:center;align-items:start;display:grid}.xJC7vG_gridLane{grid-template-columns:minmax(0,720px) minmax(0,420px)}.xJC7vG_paper{border:1px solid var(--dsw-alias-border-l1);border-radius:var(--dsw-radius-lg);background:var(--dsw-alias-bg-layer-1);min-width:0;padding:28px clamp(18px,5%,56px) 40px}.xJC7vG_h1,.xJC7vG_h2{font-family:var(--fr-read);text-wrap:balance;margin:22px 0 8px;font-size:26px;line-height:1.2}.xJC7vG_h2{font-size:20px}.xJC7vG_h3{color:var(--dsw-alias-label-secondary);letter-spacing:.06em;text-transform:uppercase;margin:24px 0 6px;font-size:13px;font-weight:600}.xJC7vG_para,.xJC7vG_code{font-family:var(--fr-read);white-space:pre-wrap;overflow-wrap:anywhere;margin:0 0 16px;font-size:18px;line-height:1.7;transition:opacity .18s linear}.xJC7vG_code{border-radius:var(--dsw-radius-md);background:var(--dsw-alias-bg-base);font-family:var(--fr-mono);padding:10px 12px;font-size:13px;line-height:1.55}@media (prefers-reduced-motion:reduce){.xJC7vG_para,.xJC7vG_code{transition:none}}.xJC7vG_flash{background:var(--fr-ai-soft);box-shadow:0 0 0 6px var(--fr-ai-soft);border-radius:2px}.xJC7vG_pn{color:var(--dsw-alias-label-tertiary);font-family:var(--fr-mono);user-select:none;margin-right:8px;font-size:11px}.xJC7vG_hl{color:inherit;background:var(--fr-hl);cursor:pointer;border-radius:2px;padding:1px 0}.xJC7vG_anchor{border-bottom:2px solid var(--fr-ai);color:inherit;background:var(--fr-ai-soft);cursor:pointer;padding:1px 0}.xJC7vG_badge,.xJC7vG_badgeButton{min-width:18px;height:18px;color:var(--dsw-static-neutral-00);background:var(--fr-ai);font-family:var(--fr-mono);user-select:none;border:0;border-radius:9px;flex:none;justify-content:center;align-items:center;padding:0 5px;font-size:11px;font-weight:500;display:inline-flex}.xJC7vG_badgeButton{vertical-align:2px;cursor:pointer;margin-left:3px}.xJC7vG_box,.xJC7vG_boxPinned{border:1px solid var(--fr-ai);border-radius:var(--dsw-radius-lg);background:var(--dsw-alias-bg-layer-1);min-width:0;font-family:var(--fr-read);flex-direction:column;font-size:16px;line-height:1.6;display:flex}.xJC7vG_boxPinned{border-width:2px}.xJC7vG_boxHead{border-bottom:1px solid var(--dsw-alias-border-l1);align-items:center;gap:8px;padding:8px 10px;display:flex}.xJC7vG_boxTitle{flex:1;min-width:0;font-weight:600}.xJC7vG_boxBody{flex-direction:column;gap:8px;min-height:0;max-height:420px;padding:10px;display:flex;overflow:auto}.xJC7vG_quote{border:0;border-left:3px solid var(--fr-ai);color:var(--dsw-alias-label-secondary);font-family:var(--fr-read);text-align:left;overflow-wrap:anywhere;cursor:pointer;background:0 0;padding:0 0 0 8px;font-size:15px;font-style:italic}.xJC7vG_msgMe,.xJC7vG_msgAi{border-radius:var(--dsw-radius-md);overflow-wrap:anywhere;padding:7px 10px}.xJC7vG_msgMe{background:var(--dsw-alias-bg-base);margin-left:14%}.xJC7vG_msgAi{background:var(--fr-ai-soft);margin-right:6%}.xJC7vG_msgMe .xJC7vG_msgText{white-space:pre-wrap}.xJC7vG_role{color:var(--dsw-alias-label-tertiary);letter-spacing:.07em;text-transform:uppercase;font-size:10px;font-weight:700}.xJC7vG_row{flex-wrap:wrap;align-items:center;gap:6px;display:flex}.xJC7vG_field{border:1px solid var(--dsw-alias-border-l2);border-radius:var(--dsw-radius-md);min-width:0;color:inherit;background:var(--dsw-alias-bg-base);font:inherit;flex:140px;padding:6px 9px}.xJC7vG_button,.xJC7vG_primary{border:1px solid var(--dsw-alias-border-l2);border-radius:var(--dsw-radius-md);color:inherit;font:inherit;cursor:pointer;background:0 0;padding:4px 9px;font-size:13px}.xJC7vG_button:hover{background:var(--dsw-alias-interactive-bg-hover)}.xJC7vG_primary{border-color:var(--fr-ai);color:var(--dsw-static-neutral-00);background:var(--fr-ai);font-weight:600}.xJC7vG_primary:disabled{opacity:.5;cursor:default}.xJC7vG_icon,.xJC7vG_iconOn{border-radius:var(--dsw-radius-md);color:var(--dsw-alias-label-secondary);font:inherit;cursor:pointer;background:0 0;border:0;padding:2px 8px;font-size:13px}.xJC7vG_icon:hover{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-interactive-bg-hover)}.xJC7vG_iconOn{color:var(--dsw-static-neutral-00);background:var(--fr-ai)}.xJC7vG_link{border:1px solid var(--fr-ai);max-width:100%;color:var(--fr-ai);font:inherit;cursor:pointer;background:0 0;border-radius:999px;align-items:center;gap:6px;padding:2px 10px;font-size:12px;display:inline-flex}.xJC7vG_link span,.xJC7vG_pick span:last-child,.xJC7vG_grow{text-overflow:ellipsis;white-space:nowrap;flex:1;min-width:0;overflow:hidden}.xJC7vG_picker{border:1px dashed var(--dsw-alias-border-l2);border-radius:var(--dsw-radius-md);flex-direction:column;gap:6px;padding:8px;display:flex}.xJC7vG_pick,.xJC7vG_folded{border:1px solid var(--dsw-alias-border-l1);border-radius:var(--dsw-radius-md);width:100%;color:inherit;font:inherit;text-align:left;cursor:pointer;background:0 0;align-items:center;gap:8px;padding:6px 8px;font-size:13px;display:flex}.xJC7vG_folded{border-left:3px solid var(--fr-ai);background:var(--dsw-alias-bg-layer-1)}.xJC7vG_grow{color:var(--dsw-alias-label-secondary)}.xJC7vG_inlineSlot{margin:-4px 0 18px}.xJC7vG_muted{color:var(--dsw-alias-label-tertiary)}.xJC7vG_error{max-width:1180px;color:var(--dsw-alias-state-error-primary);margin:0 auto 8px}.xJC7vG_empty{max-width:760px;color:var(--dsw-alias-label-secondary);flex-direction:column;gap:4px;margin:48px auto;display:flex}.xJC7vG_lane{align-self:stretch;min-width:0;padding-left:20px}.xJC7vG_lane>*{animation:.16s ease-out xJC7vG_fr-settle;position:sticky;box-shadow:0 6px 20px #0000001f}.xJC7vG_lane .xJC7vG_boxBody{max-height:min(46vh,380px)}.xJC7vG_laneChip{border:1px solid var(--dsw-alias-border-l1);border-left:3px solid var(--fr-ai);border-radius:var(--dsw-radius-md);width:100%;height:36px;color:inherit;background:var(--dsw-alias-bg-layer-1);font:inherit;text-align:left;white-space:nowrap;cursor:pointer;align-items:center;gap:8px;padding:0 10px;font-size:13px;display:flex}@keyframes xJC7vG_fr-settle{0%{opacity:.4;transform:translateY(4px)}}@media (prefers-reduced-motion:reduce){.xJC7vG_lane>*{animation:none}}.xJC7vG_selbar{z-index:40;border-radius:var(--dsw-radius-md);background:var(--dsw-alias-label-primary);gap:2px;padding:4px;display:flex;position:fixed;transform:translate(-50%,calc(-100% - 8px));box-shadow:0 4px 16px #00000040}.xJC7vG_selbar button{border-radius:var(--dsw-radius-sm);color:var(--dsw-alias-bg-base);font:inherit;white-space:nowrap;cursor:pointer;background:0 0;border:0;padding:6px 10px;font-weight:500}.xJC7vG_selbar button:hover{background:#7f7f7f59}.xJC7vG_mdP,.xJC7vG_mdHeading,.xJC7vG_mdList,.xJC7vG_mdPre{margin:0 0 8px}.xJC7vG_mdP:last-child,.xJC7vG_mdList:last-child,.xJC7vG_mdPre:last-child{margin-bottom:0}.xJC7vG_mdHeading{font-weight:600}.xJC7vG_mdList{padding-left:22px}.xJC7vG_mdList li{margin:2px 0}.xJC7vG_mdCode,.xJC7vG_mdPre{border-radius:var(--dsw-radius-sm);background:var(--dsw-alias-bg-base);font-family:var(--fr-mono);font-size:.82em}.xJC7vG_mdCode{padding:1px 4px}.xJC7vG_mdPre{white-space:pre;padding:8px 10px;overflow-x:auto}.xJC7vG_mdLink{text-decoration:underline dotted}";
		const tagId = "dsh-focus-reader/ReaderPage.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-focus-reader";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var ReaderPage_module_css_default = {
			"anchor": "xJC7vG_anchor",
			"badge": "xJC7vG_badge",
			"badgeButton": "xJC7vG_badgeButton",
			"bar": "xJC7vG_bar",
			"box": "xJC7vG_box",
			"boxBody": "xJC7vG_boxBody",
			"boxHead": "xJC7vG_boxHead",
			"boxPinned": "xJC7vG_boxPinned",
			"boxTitle": "xJC7vG_boxTitle",
			"button": "xJC7vG_button",
			"code": "xJC7vG_code",
			"empty": "xJC7vG_empty",
			"error": "xJC7vG_error",
			"field": "xJC7vG_field",
			"flash": "xJC7vG_flash",
			"folded": "xJC7vG_folded",
			"fr-settle": "xJC7vG_fr-settle",
			"grid": "xJC7vG_grid",
			"gridLane": "xJC7vG_gridLane",
			"grow": "xJC7vG_grow",
			"h1": "xJC7vG_h1",
			"h2": "xJC7vG_h2",
			"h3": "xJC7vG_h3",
			"hl": "xJC7vG_hl",
			"icon": "xJC7vG_icon",
			"iconOn": "xJC7vG_iconOn",
			"inlineSlot": "xJC7vG_inlineSlot",
			"lane": "xJC7vG_lane",
			"laneChip": "xJC7vG_laneChip",
			"link": "xJC7vG_link",
			"mdCode": "xJC7vG_mdCode",
			"mdHeading": "xJC7vG_mdHeading",
			"mdLink": "xJC7vG_mdLink",
			"mdList": "xJC7vG_mdList",
			"mdP": "xJC7vG_mdP",
			"mdPre": "xJC7vG_mdPre",
			"msgAi": "xJC7vG_msgAi",
			"msgMe": "xJC7vG_msgMe",
			"msgText": "xJC7vG_msgText",
			"muted": "xJC7vG_muted",
			"page": "xJC7vG_page",
			"paper": "xJC7vG_paper",
			"para": "xJC7vG_para",
			"pick": "xJC7vG_pick",
			"picker": "xJC7vG_picker",
			"pn": "xJC7vG_pn",
			"primary": "xJC7vG_primary",
			"quote": "xJC7vG_quote",
			"role": "xJC7vG_role",
			"row": "xJC7vG_row",
			"selbar": "xJC7vG_selbar",
			"select": "xJC7vG_select",
			"toggle": "xJC7vG_toggle"
		};
		//#endregion
		//#region src/client/Markdown.tsx
		const INLINE = /(`[^`\n]+`|\*\*[^*\n]+\*\*|__[^_\n]+__|\*[^*\s][^*\n]*\*|\[[^\]\n]+\]\([^)\s]+\))/g;
		function inline(text, keyPrefix) {
			return text.split(INLINE).map((part, index) => {
				const key = `${keyPrefix}-${index}`;
				if (index % 2 === 0) return part;
				if (part.startsWith("`")) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("code", {
					className: ReaderPage_module_css_default.mdCode,
					children: part.slice(1, -1)
				}, key);
				if (part.startsWith("**") || part.startsWith("__")) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: inline(part.slice(2, -2), key) }, key);
				if (part.startsWith("*")) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("em", { children: inline(part.slice(1, -1), key) }, key);
				return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					className: ReaderPage_module_css_default.mdLink,
					title: part.slice(part.indexOf("](") + 2, -1),
					children: part.slice(1, part.indexOf("]("))
				}, key);
			});
		}
		const BULLET = /^\s*[-*+]\s+(.*)$/;
		const NUMBER = /^\s*\d+[.)]\s+(.*)$/;
		const HEADING = /^#{1,6}\s+(.*)$/;
		const FENCE = /^\s*(```|~~~)/;
		/**
		* Render Markdown text as React elements.
		* @param props - `text` is the Markdown source.
		* @returns block elements in source order.
		*/
		function Markdown({ text }) {
			const out = [];
			const lines = text.replace(/\r\n?/g, "\n").split("\n");
			let para = [];
			let list;
			const flush = () => {
				const key = out.length;
				if (para.length > 0) out.push(/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
					className: ReaderPage_module_css_default.mdP,
					children: inline(para.join(" "), `p${key}`)
				}, key));
				if (list !== void 0) {
					const Tag = list.ordered ? "ol" : "ul";
					out.push(/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Tag, {
						className: ReaderPage_module_css_default.mdList,
						children: list.items.map((item, index) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("li", { children: inline(item, `l${key}-${index}`) }, index))
					}, key));
				}
				para = [];
				list = void 0;
			};
			for (let index = 0; index < lines.length; index += 1) {
				const line = lines[index] ?? "";
				if (FENCE.test(line)) {
					flush();
					const code = [];
					index += 1;
					while (index < lines.length && !FENCE.test(lines[index] ?? "")) {
						code.push(lines[index] ?? "");
						index += 1;
					}
					out.push(/* @__PURE__ */ (0, react_jsx_runtime.jsx)("pre", {
						className: ReaderPage_module_css_default.mdPre,
						children: code.join("\n")
					}, out.length));
					continue;
				}
				const heading = HEADING.exec(line);
				const bullet = BULLET.exec(line);
				const number = NUMBER.exec(line);
				if (heading !== null) {
					flush();
					out.push(/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: ReaderPage_module_css_default.mdHeading,
						children: inline(heading[1] ?? "", `h${out.length}`)
					}, out.length));
				} else if (bullet !== null || number !== null) {
					const ordered = bullet === null;
					if (para.length > 0 || list !== void 0 && list.ordered !== ordered) flush();
					list ??= {
						ordered,
						items: []
					};
					list.items.push((bullet ?? number)?.[1] ?? "");
				} else if (line.trim() === "") flush();
				else if (list !== void 0) {
					const last = list.items.length - 1;
					list.items[last] = `${list.items[last] ?? ""} ${line.trim()}`;
				} else para.push(line.trim());
			}
			flush();
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(react_jsx_runtime.Fragment, { children: out });
		}
		//#endregion
		//#region src/client/ReaderPage.tsx
		/**
		* Reader page: one centred reading column whose brightness follows the scroll
		* position, highlights, and AI sessions that open beside the passage they are
		* anchored to. A session follows its passage, holds at the top once it gets
		* there, and folds into a one-line chip when the next open session arrives.
		* Opening a session closes every other one that is not pinned.
		*/
		/** Container width above which sessions sit in a lane beside the text. */
		const WIDE = 980;
		/** Distance from the top of the page at which a session holds, below the document bar. */
		const STICK_TOP = 58;
		/** Height reserved for each folded session above a held one. */
		const CHIP_ROW = 44;
		const LANE_GAP = 12;
		const LAST_DOC_KEY = "focus-reader:last-doc";
		const EMPTY = {
			highlights: [],
			sessions: []
		};
		const short = (text, max = 60) => text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
		const calm = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
		const newId = (prefix) => `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
		async function api(route, init) {
			const response = await fetch(route, {
				...init,
				headers: {
					accept: "application/json",
					...init?.headers
				}
			});
			const body = await response.json();
			if (!response.ok) throw new Error(body.error ?? `HTTP ${response.status}`);
			return body;
		}
		function remembered() {
			try {
				return localStorage.getItem(LAST_DOC_KEY) ?? "";
			} catch (error) {
				return "";
			}
		}
		function remember(name) {
			try {
				localStorage.setItem(LAST_DOC_KEY, name);
			} catch (error) {}
		}
		/** Find where an anchor's text now sits; the file may have been edited since the note was made. */
		function locate(anchor, paras) {
			if (paras[anchor.p]?.slice(anchor.start, anchor.end) === anchor.text) return anchor;
			const order = [anchor.p, ...paras.keys()];
			for (const p of order) {
				const at = paras[p]?.indexOf(anchor.text) ?? -1;
				if (at >= 0) return {
					...anchor,
					p,
					start: at,
					end: at + anchor.text.length
				};
			}
		}
		function SessionBox(props) {
			const { session, sessions, busy, anyBusy, error, picking, t } = props;
			const [draft, setDraft] = (0, react.useState)("");
			const bodyRef = (0, react.useRef)(null);
			(0, react.useEffect)(() => {
				const body = bodyRef.current;
				if (body !== null) body.scrollTop = body.scrollHeight;
			}, [session.msgs.length, busy]);
			const send = () => {
				const text = draft.trim();
				if (text === "" || anyBusy) return;
				setDraft("");
				props.onAsk(text);
			};
			const linked = session.links.map((id) => sessions.find((other) => other.id === id)).filter((other) => other !== void 0);
			const others = sessions.filter((other) => other.id !== session.id && !session.links.includes(other.id));
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: session.pinned ? ReaderPage_module_css_default.boxPinned : ReaderPage_module_css_default.box,
				"data-box": session.id,
				"data-slot": session.id,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: ReaderPage_module_css_default.boxHead,
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: ReaderPage_module_css_default.badge,
							children: session.n
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
							className: ReaderPage_module_css_default.boxTitle,
							children: ["¶", session.p + 1]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: session.pinned ? ReaderPage_module_css_default.iconOn : ReaderPage_module_css_default.icon,
							"aria-pressed": session.pinned,
							title: t("session.pinHint"),
							onClick: props.onPin,
							children: session.pinned ? t("session.pinned") : t("session.pin")
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: ReaderPage_module_css_default.icon,
							onClick: props.onClose,
							children: t("session.close")
						})
					]
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: ReaderPage_module_css_default.boxBody,
					ref: bodyRef,
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
							type: "button",
							className: ReaderPage_module_css_default.quote,
							title: t("session.goto"),
							onClick: props.onJump,
							children: [
								"“",
								session.text,
								"”"
							]
						}),
						session.msgs.length === 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: ReaderPage_module_css_default.muted,
							children: t("session.new")
						}),
						session.msgs.map((message, index) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: message.role === "me" ? ReaderPage_module_css_default.msgMe : ReaderPage_module_css_default.msgAi,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: ReaderPage_module_css_default.role,
								children: message.role === "me" ? t("session.me") : t("session.ai")
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: ReaderPage_module_css_default.msgText,
								children: message.role === "ai" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Markdown, { text: message.text }) : message.text
							})]
						}, index)),
						busy && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: ReaderPage_module_css_default.muted,
							children: t("session.thinking")
						}),
						error !== "" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: ReaderPage_module_css_default.error,
							children: t("failed", { message: error })
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: ReaderPage_module_css_default.row,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
								className: ReaderPage_module_css_default.field,
								type: "text",
								value: draft,
								placeholder: t("session.placeholder"),
								"aria-label": t("session.placeholder"),
								onChange: (event) => {
									setDraft(event.target.value);
								},
								onKeyDown: (event) => {
									if (event.key === "Enter" && !event.nativeEvent.isComposing) send();
								}
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: ReaderPage_module_css_default.primary,
								disabled: anyBusy || draft.trim() === "",
								onClick: send,
								children: t("session.send")
							})]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: ReaderPage_module_css_default.row,
							children: [linked.map((other) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
								type: "button",
								className: ReaderPage_module_css_default.link,
								title: t("session.linked", { n: other.n }),
								onClick: () => {
									props.onOpenLinked(other);
								},
								children: [
									"↔ ",
									other.n,
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: short(other.text, 30) })
								]
							}, other.id)), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: ReaderPage_module_css_default.button,
								onClick: () => {
									props.onPick(!picking);
								},
								children: picking ? t("session.cancel") : t("session.link")
							})]
						}),
						picking && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: ReaderPage_module_css_default.picker,
							children: [others.length === 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: ReaderPage_module_css_default.muted,
								children: t("session.noOthers")
							}), others.map((other) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
								type: "button",
								className: ReaderPage_module_css_default.pick,
								onClick: () => {
									props.onLink(other);
								},
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: ReaderPage_module_css_default.badge,
									children: other.n
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [
									"¶",
									other.p + 1,
									" · ",
									short(other.text, 44)
								] })]
							}, other.id))]
						})
					]
				})]
			});
		}
		/**
		* Render the reader.
		* @param props - the main panel's runtime props and this page's translator.
		* @returns the page.
		*/
		function ReaderPage({ t }) {
			const [library, setLibrary] = (0, react.useState)(void 0);
			const [name, setName] = (0, react.useState)("");
			const [blocks, setBlocks] = (0, react.useState)(void 0);
			const [notes, setNotes] = (0, react.useState)(EMPTY);
			const [open, setOpen] = (0, react.useState)(/* @__PURE__ */ new Set());
			const [picking, setPicking] = (0, react.useState)("");
			const [busy, setBusy] = (0, react.useState)("");
			const [askError, setAskError] = (0, react.useState)({
				id: "",
				message: ""
			});
			const [error, setError] = (0, react.useState)("");
			const [saveError, setSaveError] = (0, react.useState)("");
			const [dim, setDim] = (0, react.useState)(true);
			const [wide, setWide] = (0, react.useState)(true);
			const [selected, setSelected] = (0, react.useState)(void 0);
			const [docked, setDocked] = (0, react.useState)(/* @__PURE__ */ new Set());
			const pageRef = (0, react.useRef)(null);
			const laneRef = (0, react.useRef)(null);
			const notesRef = (0, react.useRef)(notes);
			notesRef.current = notes;
			const nameRef = (0, react.useRef)(name);
			nameRef.current = name;
			const fail = (reason) => reason instanceof Error ? reason.message : String(reason);
			(0, react.useEffect)(() => {
				let live = true;
				api(READER_DOCS_ROUTE).then((payload) => {
					if (!live) return;
					setLibrary(payload);
					const last = remembered();
					if (payload.docs.some((doc) => doc.name === last)) setName(last);
				}).catch((reason) => {
					if (live) setError(fail(reason));
				});
				return () => {
					live = false;
				};
			}, []);
			(0, react.useEffect)(() => {
				if (name === "") return;
				let live = true;
				setBlocks(void 0);
				setError("");
				setOpen(/* @__PURE__ */ new Set());
				setPicking("");
				api(`${READER_DOC_ROUTE}?name=${encodeURIComponent(name)}`).then((payload) => {
					if (!live) return;
					setBlocks(payload.blocks);
					setNotes(payload.notes);
					setOpen(new Set(payload.notes.sessions.filter((session) => session.pinned).map((session) => session.id)));
					remember(name);
					pageRef.current?.scrollTo({ top: 0 });
				}).catch((reason) => {
					if (live) setError(fail(reason));
				});
				return () => {
					live = false;
				};
			}, [name]);
			/** Apply a change to the notes and save the result for the current document. */
			const update = (0, react.useCallback)((change) => {
				const next = change(notesRef.current);
				notesRef.current = next;
				setNotes(next);
				api(`${READER_NOTES_ROUTE}?name=${encodeURIComponent(nameRef.current)}`, {
					method: "PUT",
					headers: { "content-type": "application/json" },
					body: JSON.stringify(next)
				}).then(() => {
					setSaveError("");
				}).catch((reason) => {
					setSaveError(fail(reason));
				});
				return next;
			}, []);
			const paras = (0, react.useMemo)(() => (blocks ?? []).filter((block) => block.kind !== "heading").map((block) => block.text), [blocks]);
			const highlights = (0, react.useMemo)(() => notes.highlights.map((item) => locate(item, paras)).filter((item) => item !== void 0), [notes, paras]);
			const sessions = (0, react.useMemo)(() => notes.sessions.map((item) => locate(item, paras)).filter((item) => item !== void 0), [notes, paras]);
			const lost = notes.highlights.length + notes.sessions.length - highlights.length - sessions.length;
			const flash = (0, react.useCallback)((p) => {
				const el = pageRef.current?.querySelector(`[data-p="${p}"]`);
				if (el === null || el === void 0) return;
				el.scrollIntoView({
					block: "center",
					behavior: calm() ? "auto" : "smooth"
				});
				el.classList.add(ReaderPage_module_css_default.flash ?? "");
				setTimeout(() => {
					el.classList.remove(ReaderPage_module_css_default.flash ?? "");
				}, 1200);
			}, []);
			/** Open one session; every other closes unless it is pinned or is `keep`. */
			const openSession = (0, react.useCallback)((id, keep = "") => {
				const pinned = notesRef.current.sessions.filter((session) => session.pinned).map((session) => session.id);
				setOpen(new Set([
					...pinned,
					keep,
					id
				].filter((item) => item !== "")));
				setPicking("");
			}, []);
			const closeSession = (session) => {
				setOpen((current) => new Set([...current].filter((id) => id !== session.id)));
				setPicking("");
				if (session.msgs.length === 0) update((current) => ({
					highlights: current.highlights,
					sessions: current.sessions.filter((item) => item.id !== session.id).map((item) => ({
						...item,
						links: item.links.filter((id) => id !== session.id)
					}))
				}));
				else if (session.pinned) update((current) => ({
					...current,
					sessions: current.sessions.map((item) => item.id === session.id ? {
						...item,
						pinned: false
					} : item)
				}));
			};
			const patchSession = (id, change) => {
				update((current) => ({
					...current,
					sessions: current.sessions.map((item) => item.id === id ? change(item) : item)
				}));
			};
			const ask = (session, text) => {
				if (busy !== "") return;
				const doc = name;
				const msgs = update((current) => ({
					...current,
					sessions: current.sessions.map((item) => item.id === session.id ? {
						...item,
						msgs: [...item.msgs, {
							role: "me",
							text
						}]
					} : item)
				})).sessions.find((item) => item.id === session.id)?.msgs ?? [];
				const request = {
					name: doc,
					p: session.p,
					passage: session.text,
					msgs
				};
				setBusy(session.id);
				setAskError({
					id: "",
					message: ""
				});
				api(READER_ASK_ROUTE, {
					method: "POST",
					headers: { "content-type": "application/json" },
					body: JSON.stringify(request)
				}).then((reply) => {
					if (nameRef.current !== doc) return;
					patchSession(session.id, (item) => ({
						...item,
						msgs: [...item.msgs, {
							role: "ai",
							text: reply.text
						}]
					}));
				}).catch((reason) => {
					setAskError({
						id: session.id,
						message: fail(reason)
					});
				}).finally(() => {
					setBusy("");
				});
			};
			const link = (a, b) => {
				update((current) => ({
					...current,
					sessions: current.sessions.map((item) => {
						const other = item.id === a.id ? b.id : item.id === b.id ? a.id : "";
						return other === "" || item.links.includes(other) ? item : {
							...item,
							links: [...item.links, other]
						};
					})
				}));
				openSession(b.id, a.id);
			};
			const overlaps = (p, start, end) => [...highlights, ...sessions].some((item) => item.p === p && start < item.end && end > item.start);
			const addHighlight = (range) => {
				if (overlaps(range.p, range.start, range.end)) return;
				update((current) => ({
					...current,
					highlights: [...current.highlights, {
						id: newId("h"),
						p: range.p,
						start: range.start,
						end: range.end,
						text: range.text
					}]
				}));
			};
			const addSession = (range) => {
				if (overlaps(range.p, range.start, range.end)) return;
				const id = newId("s");
				update((current) => ({
					...current,
					sessions: [...current.sessions, {
						id,
						p: range.p,
						start: range.start,
						end: range.end,
						text: range.text,
						n: Math.max(0, ...current.sessions.map((item) => item.n)) + 1,
						msgs: [],
						links: [],
						pinned: false
					}]
				}));
				openSession(id);
			};
			(0, react.useEffect)(() => {
				const page = pageRef.current;
				if (page === null) return;
				const observer = new ResizeObserver(() => {
					setWide(page.clientWidth > WIDE);
				});
				observer.observe(page);
				return () => {
					observer.disconnect();
				};
			}, []);
			const applyFocus = (0, react.useCallback)(() => {
				const page = pageRef.current;
				if (page === null) return;
				const els = [...page.querySelectorAll("[data-p]")];
				if (!dim) {
					for (const el of els) el.style.opacity = "";
					return;
				}
				const frame = page.getBoundingClientRect();
				const mid = frame.top + frame.height * .45;
				const span = frame.height * .5;
				const dist = els.map((el) => {
					const rect = el.getBoundingClientRect();
					return rect.top <= mid && rect.bottom >= mid ? 0 : Math.min(Math.abs(rect.top - mid), Math.abs(rect.bottom - mid)) / span;
				});
				const nearest = Math.min(...dist);
				els.forEach((el, index) => {
					el.style.opacity = String(Math.max(.28, Math.min(1, 1 - ((dist[index] ?? 0) - nearest) * 1.15)));
				});
			}, [dim]);
			const checkDock = (0, react.useCallback)(() => {
				const lane = laneRef.current;
				const page = pageRef.current;
				if (lane === null || page === null) return;
				const pageTop = page.getBoundingClientRect().top;
				const els = [...lane.querySelectorAll("[data-slot]")];
				const next = /* @__PURE__ */ new Set();
				els.forEach((el, index) => {
					const after = els[index + 1];
					const id = el.dataset.slot;
					if (after === void 0 || id === void 0) {
						el.style.clipPath = "";
						return;
					}
					const afterTop = after.getBoundingClientRect().top;
					const cut = el.getBoundingClientRect().bottom - (afterTop - LANE_GAP);
					el.style.clipPath = cut > 0 && el.dataset.box !== void 0 ? `inset(0 0 ${cut}px 0 round 10px)` : "";
					if (afterTop <= pageTop + STICK_TOP + (index + 1) * CHIP_ROW + .5) next.add(id);
				});
				setDocked((current) => current.size === next.size && [...next].every((id) => current.has(id)) ? current : next);
			}, []);
			(0, react.useEffect)(() => {
				const page = pageRef.current;
				if (page === null) return;
				let frame = 0;
				const queue = () => {
					if (frame !== 0) return;
					frame = requestAnimationFrame(() => {
						frame = 0;
						applyFocus();
						checkDock();
					});
				};
				page.addEventListener("scroll", queue, { passive: true });
				return () => {
					page.removeEventListener("scroll", queue);
					cancelAnimationFrame(frame);
				};
			}, [applyFocus, checkDock]);
			const openList = sessions.filter((session) => open.has(session.id)).sort((a, b) => a.p - b.p || a.start - b.start);
			const laneOn = wide && openList.length > 0;
			(0, react.useLayoutEffect)(() => {
				applyFocus();
				const lane = laneRef.current;
				const page = pageRef.current;
				if (lane === null || page === null || !laneOn) return;
				const place = () => {
					const laneTop = lane.getBoundingClientRect().top;
					let bottom = 0;
					lane.querySelectorAll("[data-slot]").forEach((el, index) => {
						const session = sessions.find((item) => item.id === el.dataset.slot);
						const para = session === void 0 ? null : page.querySelector(`[data-p="${session.p}"]`);
						if (para === null) return;
						const want = para.getBoundingClientRect().top - laneTop;
						const top = Math.max(want, bottom + (index === 0 ? 0 : LANE_GAP));
						el.style.marginTop = `${top - bottom}px`;
						el.style.top = `${STICK_TOP + index * CHIP_ROW}px`;
						bottom = top + el.offsetHeight;
					});
					checkDock();
				};
				place();
				const observer = new ResizeObserver(place);
				for (const el of lane.querySelectorAll("[data-slot]")) observer.observe(el);
				return () => {
					observer.disconnect();
				};
			});
			(0, react.useEffect)(() => {
				let timer = 0;
				const read = () => {
					const selection = getSelection();
					const page = pageRef.current;
					if (selection === null || selection.isCollapsed || selection.rangeCount === 0 || page === null) {
						setSelected(void 0);
						return;
					}
					const range = selection.getRangeAt(0);
					const paraOf = (node) => (node instanceof Element ? node : node.parentElement)?.closest("[data-p]") ?? null;
					const para = paraOf(range.startContainer);
					if (para === null || para !== paraOf(range.endContainer) || !page.contains(para)) {
						setSelected(void 0);
						return;
					}
					const before = document.createRange();
					before.selectNodeContents(para);
					before.setEnd(range.startContainer, range.startOffset);
					const fragment = before.cloneContents();
					fragment.querySelectorAll("[data-skip]").forEach((el) => {
						el.remove();
					});
					const start = fragment.textContent?.length ?? 0;
					const text = range.toString();
					const p = Number(para.dataset.p);
					if (text.trim().length < 3 || paras[p]?.slice(start, start + text.length) !== text) {
						setSelected(void 0);
						return;
					}
					const rect = range.getBoundingClientRect();
					setSelected({
						p,
						start,
						end: start + text.length,
						text,
						left: rect.left + rect.width / 2,
						top: rect.top
					});
				};
				const onChange = () => {
					clearTimeout(timer);
					timer = window.setTimeout(read, 180);
				};
				document.addEventListener("selectionchange", onChange);
				return () => {
					document.removeEventListener("selectionchange", onChange);
					clearTimeout(timer);
				};
			}, [paras]);
			const act = (run) => {
				if (selected !== void 0) run(selected);
				getSelection()?.removeAllRanges();
				setSelected(void 0);
			};
			const box = (session) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(SessionBox, {
				session,
				sessions,
				busy: busy === session.id,
				anyBusy: busy !== "",
				error: askError.id === session.id ? askError.message : "",
				picking: picking === session.id,
				t,
				onAsk: (text) => {
					ask(session, text);
				},
				onPin: () => {
					patchSession(session.id, (item) => ({
						...item,
						pinned: !item.pinned
					}));
				},
				onClose: () => {
					closeSession(session);
				},
				onJump: () => {
					flash(session.p);
				},
				onPick: (on) => {
					setPicking(on ? session.id : "");
				},
				onLink: (other) => {
					link(session, other);
				},
				onOpenLinked: (other) => {
					openSession(other.id, session.id);
					flash(other.p);
				}
			}, session.id);
			const paragraph = (block, p) => {
				const anchors = [...highlights.filter((item) => item.p === p).map((item) => ({
					item,
					session: void 0
				})), ...sessions.filter((item) => item.p === p).map((item) => ({
					item,
					session: item
				}))].sort((a, b) => a.item.start - b.item.start);
				const parts = [];
				let at = 0;
				for (const { item, session } of anchors) {
					if (item.start < at) continue;
					parts.push(block.text.slice(at, item.start));
					if (session === void 0) parts.push(/* @__PURE__ */ (0, react_jsx_runtime.jsx)("mark", {
						className: ReaderPage_module_css_default.hl,
						title: t("highlight.remove"),
						onClick: () => {
							if (getSelection()?.isCollapsed === false) return;
							update((current) => ({
								...current,
								highlights: current.highlights.filter((other) => other.id !== item.id)
							}));
						},
						children: item.text
					}, item.id));
					else parts.push(/* @__PURE__ */ (0, react_jsx_runtime.jsx)("mark", {
						className: ReaderPage_module_css_default.anchor,
						title: t("session.open", { n: session.n }),
						onClick: () => {
							openSession(session.id);
						},
						children: item.text
					}, item.id), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						"data-skip": "",
						className: ReaderPage_module_css_default.badgeButton,
						"aria-label": t("session.open", { n: session.n }),
						onClick: () => {
							openSession(session.id);
						},
						children: session.n
					}, `${item.id}-badge`));
					at = item.end;
				}
				parts.push(block.text.slice(at));
				return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("p", {
					className: block.kind === "code" ? ReaderPage_module_css_default.code : ReaderPage_module_css_default.para,
					"data-p": p,
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
						className: ReaderPage_module_css_default.pn,
						"data-skip": "",
						children: ["¶", p + 1]
					}), parts]
				}), !wide && sessions.filter((item) => item.p === p).map((session) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: ReaderPage_module_css_default.inlineSlot,
					children: open.has(session.id) ? box(session) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
						type: "button",
						className: ReaderPage_module_css_default.folded,
						onClick: () => {
							openSession(session.id);
						},
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: ReaderPage_module_css_default.badge,
								children: session.n
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: ReaderPage_module_css_default.grow,
								children: session.msgs.length > 0 ? short(session.msgs.at(-1)?.text ?? "", 80) : t("session.blank")
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: ReaderPage_module_css_default.muted,
								children: t("session.count", { count: session.msgs.length })
							})
						]
					})
				}, session.id))] }, `p${p}`);
			};
			let p = -1;
			const body = (blocks ?? []).map((block, index) => {
				if (block.kind === "heading") {
					const Tag = block.level <= 1 ? "h1" : block.level === 2 ? "h2" : "h3";
					return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Tag, {
						className: ReaderPage_module_css_default[Tag],
						children: block.text
					}, `h${index}`);
				}
				p += 1;
				return paragraph(block, p);
			});
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: ReaderPage_module_css_default.page,
				ref: pageRef,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: ReaderPage_module_css_default.bar,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("select", {
							className: ReaderPage_module_css_default.select,
							value: name,
							"aria-label": t("choose"),
							onChange: (event) => {
								setName(event.target.value);
							},
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
								value: "",
								disabled: true,
								children: t("choose")
							}), (library?.docs ?? []).map((doc) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
								value: doc.name,
								children: doc.name
							}, doc.name))]
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
							className: ReaderPage_module_css_default.toggle,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
								type: "checkbox",
								checked: dim,
								onChange: (event) => {
									setDim(event.target.checked);
								}
							}), t("fade")]
						})]
					}),
					error !== "" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: ReaderPage_module_css_default.error,
						children: t("failed", { message: error })
					}),
					saveError !== "" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: ReaderPage_module_css_default.error,
						children: t("save.failed", { message: saveError })
					}),
					library !== void 0 && library.docs.length === 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: ReaderPage_module_css_default.empty,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: t("empty.title") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("empty.body", { folder: library.libraryDir }) })]
					}),
					library !== void 0 && library.docs.length > 0 && name === "" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: ReaderPage_module_css_default.empty,
						children: t("pick.title")
					}),
					name !== "" && blocks === void 0 && error === "" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: ReaderPage_module_css_default.empty,
						children: t("loading")
					}),
					blocks !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: laneOn ? ReaderPage_module_css_default.gridLane : ReaderPage_module_css_default.grid,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("article", {
							className: ReaderPage_module_css_default.paper,
							children: [lost > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
								className: ReaderPage_module_css_default.muted,
								children: t("moved", { count: lost })
							}), body]
						}), laneOn && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: ReaderPage_module_css_default.lane,
							ref: laneRef,
							children: openList.map((session) => docked.has(session.id) ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
								type: "button",
								"data-slot": session.id,
								className: ReaderPage_module_css_default.laneChip,
								title: t("session.goto"),
								onClick: () => {
									flash(session.p);
								},
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: ReaderPage_module_css_default.badge,
										children: session.n
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: ["↑ ¶", session.p + 1] }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: ReaderPage_module_css_default.grow,
										children: session.msgs.length > 0 ? short(session.msgs.at(-1)?.text ?? "", 80) : t("session.blank")
									})
								]
							}, session.id) : box(session))
						})]
					}),
					selected !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: ReaderPage_module_css_default.selbar,
						style: {
							left: selected.left,
							top: selected.top
						},
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							onPointerDown: (event) => {
								event.preventDefault();
							},
							onClick: () => {
								act(addHighlight);
							},
							children: t("select.highlight")
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							onPointerDown: (event) => {
								event.preventDefault();
							},
							onClick: () => {
								act(addSession);
							},
							children: t("select.session")
						})]
					})
				]
			});
		}
		//#endregion
		//#region src/client/locales.ts
		/** Web dictionaries for the focus reader page. */
		/** Locale namespace owned by this page. */
		const NS = "focus-reader";
		/** English dictionary and key source. */
		const en = {
			panel: "Reader",
			choose: "Choose a document",
			fade: "Fade text I am not reading",
			loading: "Opening…",
			"empty.title": "Nothing to read yet",
			"empty.body": "Put .md or .txt files in {folder}, then reload this page.",
			"pick.title": "Choose a document above to start reading.",
			failed: "That did not work: {message}",
			"save.failed": "Your last change was not saved: {message}",
			"select.highlight": "Highlight",
			"select.session": "Open AI session",
			"highlight.remove": "Remove this highlight",
			"session.open": "Open AI session {n}",
			"session.goto": "Go to this passage",
			"session.new": "New session on this passage. Ask anything.",
			"session.placeholder": "Ask about this passage",
			"session.send": "Send",
			"session.thinking": "Thinking…",
			"session.pin": "Pin",
			"session.pinned": "Pinned",
			"session.pinHint": "A pinned session stays open when you open another",
			"session.close": "Close",
			"session.link": "Link",
			"session.cancel": "Cancel",
			"session.linked": "Open linked session {n}",
			"session.noOthers": "No other session to link to yet. Open one on another passage first.",
			"session.me": "Me",
			"session.ai": "AI",
			"session.count": "{count} msgs",
			"session.blank": "Empty session",
			moved: "{count} notes point at text that is no longer in this file. They are kept in the notes file."
		};
		/** Simplified Chinese dictionary checked against the English key set. */
		const zh = {
			panel: "阅读器",
			choose: "选择文档",
			fade: "淡化我没在读的文字",
			loading: "正在打开…",
			"empty.title": "还没有可读的内容",
			"empty.body": "把 .md 或 .txt 文件放进 {folder}，然后重新加载此页面。",
			"pick.title": "在上方选择一个文档开始阅读。",
			failed: "操作未成功：{message}",
			"save.failed": "上一次修改没有保存：{message}",
			"select.highlight": "高亮",
			"select.session": "开启 AI 会话",
			"highlight.remove": "移除这条高亮",
			"session.open": "打开 AI 会话 {n}",
			"session.goto": "跳到这段文字",
			"session.new": "这段文字上的新会话，随便问。",
			"session.placeholder": "就这段文字提问",
			"session.send": "发送",
			"session.thinking": "思考中…",
			"session.pin": "固定",
			"session.pinned": "已固定",
			"session.pinHint": "固定的会话在你打开其他会话时保持展开",
			"session.close": "关闭",
			"session.link": "关联",
			"session.cancel": "取消",
			"session.linked": "打开关联的会话 {n}",
			"session.noOthers": "还没有其他会话可关联。先在另一段文字上开启一个。",
			"session.me": "我",
			"session.ai": "AI",
			"session.count": "{count} 条消息",
			"session.blank": "空会话",
			moved: "有 {count} 条笔记指向的文字已不在此文件中。它们仍保留在笔记文件里。"
		};
		//#endregion
		//#region src/client/index.ts
		const PANEL_ID = "focus-reader";
		/** Required browser services: slots and localized copy. */
		const inject = ["slots", "locale"];
		/**
		* Register the dictionaries, the page, and its sidebar entry.
		* @param ctx - browser services used by these contributions.
		*/
		function apply(ctx) {
			ctx.effect(() => ctx.locale.register(NS, {
				zh,
				en
			}), "focus-reader: dictionaries");
			const t = ctx.locale.bind(NS);
			ctx.effect(() => ctx.slots.inject("main", () => ctx.slots.register({
				name: "main",
				key: PANEL_ID,
				locale: NS
			}, ReaderPage)), "focus-reader: page");
			ctx.effect(() => ctx.slots.inject("sidebar.panellist", () => ctx.slots.register({
				name: "sidebar.panellist",
				id: PANEL_ID,
				order: 6,
				locale: NS,
				label: () => t("panel")
			}, ReaderIcon)), "focus-reader: sidebar entry");
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

