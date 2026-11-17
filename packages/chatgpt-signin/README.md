# dsh-chatgpt-signin

A DSH plugin that adds a **Sign in with ChatGPT** card to its own page under Plugins. After one sign-in, GPT models appear in the model picker of the message box and use the ChatGPT plan of the account that signed in.

DSH already contains the ChatGPT sign-in: the built-in model adapter (`llm-pi-ai`) registers it with the `authorization` service, but no screen of DSH starts it. This plugin is that screen. It owns no sign-in protocol and never sees a token.

## Install

```sh
dsh plugin --profile web add /absolute/path/to/research-os/packages/chatgpt-signin
```

In the desktop app, use Plugins → Add plugin and paste the same folder path.

## Using it

1. Open Plugins → ChatGPT sign-in.
2. Choose **Sign in with ChatGPT**, then **Open the ChatGPT sign-in page**. The page opens in your browser.
3. Sign in there. The browser returns to `localhost:1455` on this computer and the card changes to **Signed in**.

- If the browser ends on a page that will not load, open "The browser ended on a page that will not load?" on the card and paste the whole address from the browser's address bar.
- **Sign in with a code instead** shows a short code to type on an OpenAI page. Use it when DSH runs on another computer than the browser, or when port 1455 is taken.
- **Stop** ends a running attempt. An attempt also ends by itself after `attemptTimeoutMs`.
- **Sign out** deletes the stored sign-in and removes the GPT models from the model picker.

## What it changes

| What | Where |
|---|---|
| The sign-in itself | Written by the sign-in flow to the DSH credential store under `llm-pi-ai/openai-codex`. Refreshed by the model adapter. |
| The models in the picker | One entry, `providers.openai-codex`, in the settings of the profile entry `llm-pi-ai`. This is the entry the Models page writes when the provider is added there. |

Sign-out removes the whole `providers.openai-codex` entry, including model changes made to it on the Models page.

## Configuration

Override the row in the profile's `cordis.patch.yml`:

```yaml
- id: chatgpt-signin
  config:
    pickerName: GPT
```

| Field | Default | Meaning |
|---|---|---|
| `provider` | `openai-codex` | Provider id of the sign-in flow to run |
| `recordScope` | `llm-pi-ai` | Registered name of the plugin that owns the flow and its stored sign-in |
| `settingsEntry` | `llm-pi-ai` | Profile entry id whose `providers` settings list the routes of the model picker |
| `addToPicker` | `true` | Add the provider to the model picker after a sign-in, and remove it on sign-out |
| `pickerName` | `ChatGPT` | Name of the provider's group in the model picker; empty keeps the provider id |
| `attemptTimeoutMs` | `900000` | Longest one attempt may run |

## Routes

All routes require the same trust check as the rest of the Web client and answer with the card's state. The state holds the sign-in page address and, for the code way, the short code; it never holds a token.

| Route | Method | Does |
|---|---|---|
| `/chatgpt-signin/state` | GET | Return the state |
| `/chatgpt-signin/start` | POST `{ "way": "browser" \| "code" }` | Start one attempt |
| `/chatgpt-signin/paste` | POST `{ "text": "…" }` | Hand the running attempt the address the browser ended on |
| `/chatgpt-signin/cancel` | POST | Stop the running attempt |
| `/chatgpt-signin/picker` | POST | Add the provider to the model picker |
| `/chatgpt-signin/signout` | POST | Delete the stored sign-in and remove the provider from the picker |

## Limitations

- The sign-in uses the ChatGPT account route that the Codex command-line tool uses. OpenAI's terms and the plan's usage limits apply, and OpenAI can change or close this route.
- The Host must reach `auth.openai.com` and `chatgpt.com`. Behind a proxy, start DSH with the proxy variables set.
- The browser way listens on port 1455, which the Codex command-line tool also uses for its own sign-in. While that port is taken, only the pasted address or the code way finishes a sign-in.
- One attempt runs at a time. The card asks the Host for the state every 1.5 seconds while an attempt runs; it is not pushed.
- After sign-out an empty `providers` section stays in the profile's `cordis.patch.yml`. It changes nothing.
