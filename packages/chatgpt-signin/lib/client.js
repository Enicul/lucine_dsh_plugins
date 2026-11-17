window.__ModuleLoader__.load({
	id: "dsh-chatgpt-signin",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");
		let react_jsx_runtime = require("react/jsx-runtime");
		//#region src/shared.ts
		/** Document-relative form of the state route, so deployment prefixes keep working. */
		const SIGNIN_STATE_ROUTE = "chatgpt-signin/state";
		/** Document-relative form of the start route. */
		const SIGNIN_START_ROUTE = "chatgpt-signin/start";
		/** Document-relative form of the paste route. */
		const SIGNIN_PASTE_ROUTE = "chatgpt-signin/paste";
		/** Document-relative form of the cancel route. */
		const SIGNIN_CANCEL_ROUTE = "chatgpt-signin/cancel";
		/** Document-relative form of the picker route. */
		const SIGNIN_PICKER_ROUTE = "chatgpt-signin/picker";
		/** Document-relative form of the sign-out route. */
		const SIGNIN_SIGNOUT_ROUTE = "chatgpt-signin/signout";
		//#endregion
		//#region \0dsh-css:./src/client/SignInCard.module.css.mjs
		const css = ".WNYsSW_card{--cs-accent:var(--dsw-alias-state-business-primary);--cs-good:#4f8a73;--cs-bad:#b4534b;border:1px solid var(--dsw-alias-border-l2);border-radius:var(--dsw-radius-md);max-width:560px;color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-layer-1);flex-direction:column;gap:12px;padding:16px;font-size:14px;line-height:1.5;display:flex}.WNYsSW_card p{margin:0}.WNYsSW_title{align-items:center;gap:8px;margin:0;font-size:15px;font-weight:600;display:flex}.WNYsSW_dot{background:var(--dsw-alias-label-secondary);opacity:.5;border-radius:50%;flex:none;width:8px;height:8px}.WNYsSW_dot[data-tone=good]{background:var(--cs-good);opacity:1}.WNYsSW_dot[data-tone=busy]{background:var(--cs-accent);opacity:1}.WNYsSW_quiet{color:var(--dsw-alias-label-secondary)}.WNYsSW_bad{color:var(--cs-bad);overflow-wrap:anywhere}.WNYsSW_row{flex-wrap:wrap;align-items:center;gap:8px 16px;display:flex}.WNYsSW_primary,.WNYsSW_plain,.WNYsSW_danger{border-radius:var(--dsw-radius-md);font:inherit;cursor:pointer;border:1px solid #0000;align-items:center;padding:7px 14px;font-weight:500;text-decoration:none;display:inline-flex}.WNYsSW_primary{color:#fff;background:var(--cs-accent)}.WNYsSW_plain{border-color:var(--dsw-alias-border-l2);color:inherit;background:0 0}.WNYsSW_danger{border-color:var(--cs-bad);color:var(--cs-bad);background:0 0}.WNYsSW_link{color:var(--dsw-alias-label-secondary);font:inherit;text-align:start;text-underline-offset:3px;cursor:pointer;background:0 0;border:0;padding:0;text-decoration:underline}.WNYsSW_primary:disabled,.WNYsSW_plain:disabled,.WNYsSW_danger:disabled,.WNYsSW_link:disabled{opacity:.5;cursor:default}.WNYsSW_primary:focus-visible,.WNYsSW_plain:focus-visible,.WNYsSW_danger:focus-visible,.WNYsSW_link:focus-visible,.WNYsSW_input:focus-visible{outline:2px solid var(--cs-accent);outline-offset:2px}.WNYsSW_steps{flex-direction:column;gap:12px;margin:0;padding:0;list-style:none;display:flex}.WNYsSW_steps li{flex-wrap:wrap;align-items:center;gap:6px 12px;display:flex}.WNYsSW_stepName{min-width:52px;color:var(--dsw-alias-label-secondary);letter-spacing:.04em;text-transform:uppercase;flex:none;font-size:12px;font-weight:600}.WNYsSW_codeRow{flex-wrap:wrap;align-items:center;gap:6px 10px;display:inline-flex}.WNYsSW_code{border:1px solid var(--dsw-alias-border-l2);border-radius:var(--dsw-radius-md);letter-spacing:.08em;user-select:all;padding:4px 10px;font-family:ui-monospace,SF Mono,Menlo,monospace;font-size:18px}.WNYsSW_paste,.WNYsSW_pasteForm{flex-direction:column;gap:8px;display:flex}.WNYsSW_pasteRow{gap:8px;display:flex}.WNYsSW_input{border:1px solid var(--dsw-alias-border-l2);border-radius:var(--dsw-radius-md);min-width:0;color:inherit;background:var(--dsw-alias-bg-base);font:inherit;flex:auto;padding:6px 8px}";
		const tagId = "dsh-chatgpt-signin/SignInCard.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-chatgpt-signin";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var SignInCard_module_css_default = {
			"bad": "WNYsSW_bad",
			"card": "WNYsSW_card",
			"code": "WNYsSW_code",
			"codeRow": "WNYsSW_codeRow",
			"danger": "WNYsSW_danger",
			"dot": "WNYsSW_dot",
			"input": "WNYsSW_input",
			"link": "WNYsSW_link",
			"paste": "WNYsSW_paste",
			"pasteForm": "WNYsSW_pasteForm",
			"pasteRow": "WNYsSW_pasteRow",
			"plain": "WNYsSW_plain",
			"primary": "WNYsSW_primary",
			"quiet": "WNYsSW_quiet",
			"row": "WNYsSW_row",
			"stepName": "WNYsSW_stepName",
			"steps": "WNYsSW_steps",
			"title": "WNYsSW_title"
		};
		//#endregion
		//#region src/client/SignInCard.tsx
		/**
		* The sign-in card on the bundle's page of the Plugins page. It shows one
		* state at a time: not signed in, signing in (one numbered step after the
		* other), or signed in. While an attempt runs the card asks the Host for the
		* state again every {@link POLL_MS} milliseconds.
		*/
		/** Wait between two state requests while an attempt runs. */
		const POLL_MS = 1500;
		async function request(route, body) {
			const response = await fetch(route, {
				method: body === void 0 ? "GET" : "POST",
				headers: {
					accept: "application/json",
					...body === void 0 ? {} : { "content-type": "application/json" }
				},
				...body === void 0 ? {} : { body: JSON.stringify(body) }
			});
			const payload = await response.json();
			if (!response.ok) throw new Error(payload.error ?? `HTTP ${response.status}`);
			return payload;
		}
		/**
		* Render the bundle's one-liner, or the sign-in card.
		* @param props - the view asked for and the card's copy.
		* @returns the one-liner, or the card.
		*/
		function SignInCard({ t, view }) {
			const [state, setState] = (0, react.useState)();
			const [error, setError] = (0, react.useState)("");
			const [busy, setBusy] = (0, react.useState)(false);
			const [confirming, setConfirming] = (0, react.useState)(false);
			const [pasting, setPasting] = (0, react.useState)(false);
			const [pasted, setPasted] = (0, react.useState)("");
			const [copied, setCopied] = (0, react.useState)(false);
			const call = (0, react.useCallback)(async (route, body) => {
				try {
					setState(await request(route, body));
					setError("");
				} catch (failure) {
					setError(failure instanceof Error ? failure.message : String(failure));
				}
			}, []);
			const act = (0, react.useCallback)(async (route, body = {}) => {
				setBusy(true);
				await call(route, body);
				setBusy(false);
			}, [call]);
			const page = view === "page";
			(0, react.useEffect)(() => {
				if (page) call(SIGNIN_STATE_ROUTE);
			}, [page, call]);
			const running = state?.running === true;
			(0, react.useEffect)(() => {
				if (!page || !running) return;
				const timer = setInterval(() => {
					call(SIGNIN_STATE_ROUTE);
				}, POLL_MS);
				return () => {
					clearInterval(timer);
				};
			}, [
				page,
				running,
				call
			]);
			(0, react.useEffect)(() => {
				if (running) return;
				setPasting(false);
				setPasted("");
				setCopied(false);
			}, [running]);
			if (!page) return t("summary");
			const failure = error === "" ? null : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
				className: SignInCard_module_css_default["bad"],
				role: "alert",
				children: t("failed").replace("{message}", () => error)
			});
			if (state === void 0) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: SignInCard_module_css_default["card"],
				children: failure ?? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
					className: SignInCard_module_css_default["quiet"],
					children: t("loading")
				})
			});
			if (!state.available) return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: SignInCard_module_css_default["card"],
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
					className: SignInCard_module_css_default["quiet"],
					children: t("unavailable")
				}), failure]
			});
			const start = (way) => {
				act(SIGNIN_START_ROUTE, { way });
			};
			const sendPaste = (event) => {
				event.preventDefault();
				if (pasted.trim() !== "") act(SIGNIN_PASTE_ROUTE, { text: pasted });
			};
			const copyCode = (code) => {
				navigator.clipboard.writeText(code).then(() => {
					setCopied(true);
				}, () => {
					setCopied(false);
				});
			};
			if (state.running) {
				const step = state.step;
				return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: SignInCard_module_css_default["card"],
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("h4", {
							className: SignInCard_module_css_default["title"],
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: SignInCard_module_css_default["dot"],
								"data-tone": "busy"
							}), t("run.title")]
						}),
						step?.url === void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
							className: SignInCard_module_css_default["quiet"],
							children: t("run.starting")
						}) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("ol", {
							className: SignInCard_module_css_default["steps"],
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: SignInCard_module_css_default["stepName"],
								children: t("run.step1")
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("a", {
								className: SignInCard_module_css_default["primary"],
								href: step.url,
								target: "_blank",
								rel: "noopener noreferrer",
								children: t(state.way === "code" ? "run.openCode" : "run.open")
							})] }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: SignInCard_module_css_default["stepName"],
								children: t("run.step2")
							}), step.code === void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("run.finish") }) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
								className: SignInCard_module_css_default["codeRow"],
								children: [
									t("run.type"),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("code", {
										className: SignInCard_module_css_default["code"],
										children: step.code
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: SignInCard_module_css_default["plain"],
										onClick: () => {
											copyCode(step.code ?? "");
										},
										children: t(copied ? "run.copied" : "run.copy")
									})
								]
							})] })]
						}),
						state.canPaste ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: SignInCard_module_css_default["paste"],
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: SignInCard_module_css_default["link"],
								"aria-expanded": pasting,
								onClick: () => {
									setPasting((open) => !open);
								},
								children: t("paste.toggle")
							}), pasting ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("form", {
								className: SignInCard_module_css_default["pasteForm"],
								onSubmit: sendPaste,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
									className: SignInCard_module_css_default["quiet"],
									children: t("paste.body")
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: SignInCard_module_css_default["pasteRow"],
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
										className: SignInCard_module_css_default["input"],
										"aria-label": t("paste.label"),
										value: pasted,
										autoComplete: "off",
										spellCheck: false,
										onChange: (event) => {
											setPasted(event.target.value);
										}
									}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										type: "submit",
										className: SignInCard_module_css_default["plain"],
										disabled: busy || pasted.trim() === "",
										children: t("paste.send")
									})]
								})]
							}) : null]
						}) : null,
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: SignInCard_module_css_default["row"],
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: SignInCard_module_css_default["plain"],
								disabled: busy,
								onClick: () => {
									act(SIGNIN_CANCEL_ROUTE);
								},
								children: t("run.stop")
							})
						}),
						failure
					]
				});
			}
			if (state.signedIn) {
				const why = state.last?.message;
				return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: SignInCard_module_css_default["card"],
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("h4", {
							className: SignInCard_module_css_default["title"],
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: SignInCard_module_css_default["dot"],
								"data-tone": "good"
							}), t("in.title")]
						}),
						state.inPicker ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: t("in.body") }) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: t("in.noPicker") }),
							why === void 0 ? null : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
								className: SignInCard_module_css_default["bad"],
								children: t("in.noPickerWhy").replace("{message}", () => why)
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: SignInCard_module_css_default["row"],
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: SignInCard_module_css_default["primary"],
									disabled: busy,
									onClick: () => {
										act(SIGNIN_PICKER_ROUTE);
									},
									children: t("in.add")
								})
							})
						] }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: SignInCard_module_css_default["row"],
							children: confirming ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: SignInCard_module_css_default["danger"],
								disabled: busy,
								onClick: () => {
									setConfirming(false);
									act(SIGNIN_SIGNOUT_ROUTE);
								},
								children: t("in.signOutConfirm")
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: SignInCard_module_css_default["plain"],
								onClick: () => {
									setConfirming(false);
								},
								children: t("in.cancel")
							})] }) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: SignInCard_module_css_default["plain"],
								disabled: busy,
								onClick: () => {
									setConfirming(true);
								},
								children: t("in.signOut")
							})
						}),
						failure
					]
				});
			}
			const last = state.last;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: SignInCard_module_css_default["card"],
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("h4", {
						className: SignInCard_module_css_default["title"],
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: SignInCard_module_css_default["dot"] }), t("out.title")]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: t("out.body") }),
					last?.status === "cancelled" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: SignInCard_module_css_default["quiet"],
						children: t("last.cancelled")
					}) : null,
					last?.status === "failed" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: SignInCard_module_css_default["bad"],
						role: "alert",
						children: t("last.failed").replace("{message}", () => last.message ?? "")
					}) : null,
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: SignInCard_module_css_default["row"],
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: SignInCard_module_css_default["primary"],
							disabled: busy,
							onClick: () => {
								start("browser");
							},
							children: t("out.browser")
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: SignInCard_module_css_default["link"],
							disabled: busy,
							onClick: () => {
								start("code");
							},
							children: t("out.code")
						})]
					}),
					failure
				]
			});
		}
		//#endregion
		//#region src/client/locales.ts
		/** Web dictionaries for the ChatGPT sign-in card. */
		/** Locale namespace owned by this card. */
		const NS = "chatgpt-signin";
		/** English dictionary and key source. */
		const en = {
			summary: "Sign in with your ChatGPT account to use GPT models in the model picker.",
			loading: "Checking…",
			failed: "That did not work: {message}",
			unavailable: "This DSH has no ChatGPT sign-in to run. It needs the built-in model adapter (llm-pi-ai) switched on.",
			"out.title": "Not signed in",
			"out.body": "Sign in once with your ChatGPT account. GPT models then appear in the model picker and use your ChatGPT plan, not API credit.",
			"out.browser": "Sign in with ChatGPT",
			"out.code": "Sign in with a code instead",
			"run.title": "Signing in",
			"run.starting": "Starting…",
			"run.step1": "Step 1",
			"run.step2": "Step 2",
			"run.open": "Open the ChatGPT sign-in page",
			"run.openCode": "Open the code page",
			"run.finish": "Sign in there. This page updates by itself when you are done.",
			"run.type": "Type this code on that page:",
			"run.copy": "Copy",
			"run.copied": "Copied",
			"run.stop": "Stop",
			"paste.toggle": "The browser ended on a page that will not load?",
			"paste.body": "Copy the whole address from the browser's address bar and paste it here.",
			"paste.label": "Address from the browser",
			"paste.send": "Send",
			"in.title": "Signed in",
			"in.body": "GPT models are in the model picker at the bottom of the message box.",
			"in.noPicker": "You are signed in, but the GPT models are not in the model picker yet.",
			"in.noPickerWhy": "Adding them failed: {message}",
			"in.add": "Add GPT models to the picker",
			"in.signOut": "Sign out",
			"in.signOutConfirm": "Sign out and remove GPT models?",
			"in.cancel": "Keep",
			"last.cancelled": "The sign-in was stopped. Nothing was changed.",
			"last.failed": "The sign-in did not finish: {message}"
		};
		/** Simplified Chinese dictionary checked against the English key set. */
		const zh = {
			summary: "用你的 ChatGPT 账号登录，在模型选择器里使用 GPT 模型。",
			loading: "正在检查…",
			failed: "操作未成功：{message}",
			unavailable: "这个 DSH 没有可运行的 ChatGPT 登录。需要启用内置的模型适配器（llm-pi-ai）。",
			"out.title": "未登录",
			"out.body": "用你的 ChatGPT 账号登录一次。之后 GPT 模型会出现在模型选择器里，使用的是你的 ChatGPT 套餐，而不是 API 额度。",
			"out.browser": "用 ChatGPT 登录",
			"out.code": "改用验证码登录",
			"run.title": "正在登录",
			"run.starting": "正在开始…",
			"run.step1": "第 1 步",
			"run.step2": "第 2 步",
			"run.open": "打开 ChatGPT 登录页",
			"run.openCode": "打开验证码页面",
			"run.finish": "在那里完成登录。完成后此页面会自动更新。",
			"run.type": "在那个页面输入这个验证码：",
			"run.copy": "复制",
			"run.copied": "已复制",
			"run.stop": "停止",
			"paste.toggle": "浏览器最后停在一个打不开的页面？",
			"paste.body": "复制浏览器地址栏里的完整地址，粘贴到这里。",
			"paste.label": "浏览器里的地址",
			"paste.send": "发送",
			"in.title": "已登录",
			"in.body": "GPT 模型已在消息框底部的模型选择器里。",
			"in.noPicker": "你已登录，但 GPT 模型还没有出现在模型选择器里。",
			"in.noPickerWhy": "添加失败：{message}",
			"in.add": "把 GPT 模型加入选择器",
			"in.signOut": "退出登录",
			"in.signOutConfirm": "退出登录并移除 GPT 模型？",
			"in.cancel": "保留",
			"last.cancelled": "登录已停止，没有任何改动。",
			"last.failed": "登录没有完成：{message}"
		};
		//#endregion
		//#region src/client/index.ts
		/** Package name of this bundle; the Plugins page looks the card up by it. */
		const BUNDLE = "dsh-chatgpt-signin";
		/** Required browser services: slots and localized copy. */
		const inject = ["slots", "locale"];
		/**
		* Register the dictionaries and the card.
		* @param ctx - browser services used by these contributions.
		*/
		function apply(ctx) {
			ctx.effect(() => ctx.locale.register(NS, {
				zh,
				en
			}), "chatgpt-signin: dictionaries");
			ctx.effect(() => ctx.slots.inject("plugins.bundle.config", () => ctx.slots.register({
				name: "plugins.bundle.config",
				key: BUNDLE,
				locale: NS
			}, SignInCard)), "chatgpt-signin: card");
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

