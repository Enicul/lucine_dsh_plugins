# dsh-voyage

A night-sea home page for DeepSeek Harness: the day's three steps, a capture box on a keyboard shortcut, a Waiting list the model can sort, and the Glow tide colours across the app.

## What it adds

- **Today page.** Listed first in the sidebar as "Today" and opened when the app starts. Home shows an animated night sea and the next unfinished step. Each finished step moves the boat toward the lighthouse; when all three are done the light comes on.
- **Today's course.** A side panel with three steps you write each day: Deep sea (toward the mission), Boat (keeps life steady), Fire (gives energy back). Text saves after a short pause in typing. The panel can be hidden.
- **Capture box.** Command + L in the desktop app (Control + L on Windows and Linux) opens a one-line box over any page. Enter files the thought and returns focus to where it was. In a web browser the command is Command or Control + Shift + L, because browsers keep the unshifted key for the address bar. The binding can be changed in the app's keyboard settings.
- **Waiting.** Every open thought, each also drawn as a lantern on the water. "Sort with AI" groups them; "Done" closes one.
- **Sea theme.** Every page except Today uses pale, low-saturation blue-grey surfaces laid over the built-in light palette. Today keeps its own night-sea colours. Loading the plugin switches the saved theme preference to light; if dark is chosen in settings, the night-blue surfaces are used instead.
- **Product wording.** A moon-over-water mark and the name "Deep Sea" replace the local-build title in the sidebar, the window title and the New Session page, whose headline becomes "One step into the deep sea". This is done with two language packs, "English · Deep Sea" and "中文 · 深海", which fall back to the built-in English and Chinese for every other string. Choosing English or Chinese selects its pack.

## Install

Build first (see the repository README), then:

```bash
dsh plugin --profile web add /absolute/path/to/research-os/packages/voyage
```

In the desktop app, use Plugins → Add plugin and enter the same absolute path.

## Configuration

Set these under the `voyage` row in the profile's `cordis.patch.yml`. A patch replaces the row's whole `config`, so repeat `dataDir` when changing anything else.

| Field | Default | Meaning |
|---|---|---|
| `dataDir` | `~/Documents/voyage` | Folder holding `voyage.json` |
| `groups` | Needs your decision, For the project, Life upkeep, Ideas to keep | Group names a sort chooses from |
| `maxThoughts` | 2000 | Most thoughts the data file may hold |
| `maxSortThoughts` | 200 | Most open thoughts one sort sends to the model |
| `maxSortTokens` | 2000 | Longest sort reply, in tokens |
| `sortTimeoutMs` | 120000 | Longest one sort may take |
| `sortPrompt` | see `src/index.ts` | Instructions given to the model before the thoughts |

## Storage

Everything is in `<dataDir>/voyage.json`: each day's three steps by date, and every thought with its capture time, group and done state. The file is replaced through a temporary file and a rename. A file that is not valid JSON is refused with an error and never overwritten.

## Model use

"Sort with AI" sends the text of the open thoughts and the group names to the composition's default model, outside any Session. Nothing is sent when you capture, tick or edit. If the reply cannot be read, or names no known group, nothing is changed.

## Known limitations

- The shortcut works while the DSH window has focus. It is not a system-wide shortcut.
- Steps do not carry over to the next day, and past days are saved but not shown.
- DSH does not yet suggest or rank the day's steps.
- Thoughts cannot be edited, regrouped by hand, or reopened after "Done".
- The plugin sets the theme preference to light each time it loads, so a dark choice in settings lasts only until the next start.
- Tests cover the data file functions only. The routes, page and capture box have no automated tests.
- English and Simplified Chinese. Other languages keep the app's own product wording.
- With the sidebar hidden on the Today page, the app's reopen and New Session icons are drawn in the light theme's dark ink and are faint against the night scene.
