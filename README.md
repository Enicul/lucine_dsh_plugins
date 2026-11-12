# research-os

Personal [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) (DSH) plugins. Each folder under `packages/` is one independently installable DSH bundle, built against the official plugin guides (`docs/user/develop/basic/` in the DSH repository).

```
research-os/
├── packages/
│   ├── focus-reader/        # read Markdown and text with highlights and AI sessions
│   └── voyage/              # night-sea home page, daily steps, capture box, Waiting list, theme
├── package.json
└── README.md
```

Planned packages, not built yet: `focus-guard`, `research-collector`, `annotation-bridge`. A `registry/` plugin index is deferred until there is something to discover.

## Conventions

- One package is one bundle: `package.json` with `dsh.bundle`, a `cordis.patch.yml`, and built JavaScript under `lib/`.
- Each bundle declares the DSH releases it supports in `engines.dsh`.
- Host plugins are function plugins (`name`, `inject`, `Config`, `apply`); every registration goes through `ctx.effect()`, so unloading cleans up.
- Deployment-varying values are `Config` fields with schema defaults, changeable from a profile's `cordis.patch.yml`.
- Built `lib/index.js` and `lib/client.js` are committed, so installing needs no build step.
- Each package has tests and a README.

## Install a package

```sh
dsh plugin --profile web add /absolute/path/to/research-os/packages/focus-reader
dsh --profile web --dump-config   # shows a "# == dsh-focus-reader" layer
```

Remove it with `dsh plugin --profile web remove dsh-focus-reader`.

## Build from source

The build reuses the DSH source checkout's compiler settings and browser-bundle preset, so this repository must be checked out as a `research-os/` folder inside a DSH source checkout that has run `pnpm install`. Then, in a package folder (use `npm run`, which runs the script without installing anything into the package):

```sh
npm run build
npm run test
```
