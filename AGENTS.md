# `@storage/*` monorepo

## Commands (run from root)

| Command           | What it does                                                                |
| ----------------- | --------------------------------------------------------------------------- |
| `deno task test`  | `deno test --allow-env --allow-read --allow-write --allow-net --allow-sys`  |
| `deno task bench` | `deno bench --allow-env --allow-read --allow-write --allow-net --allow-sys` |
| `deno task lint`  | `deno lint && deno doc --lint **/*.ts`                                      |
| `deno task ok`    | fmt → lint → `deno check` → test → `deno publish --dry-run --allow-dirty`   |
| `deno task lock`  | Delete `deno.lock`, reinstall, recheck                                      |

CI order: `deno fmt --check` → `deno task lint` → `deno check` →
`deno task test` → `deno publish --dry-run`.

Run a single package's tests: `deno test <dir>/` (e.g. `deno test deno-kv/`).

## Workspace structure

13 workspace members under `@storage/*` (plus `@storage/bench`):

| Package                | Dir            | Purpose                                                       |
| ---------------------- | -------------- | ------------------------------------------------------------- |
| `@storage/main`        | `main/`        | Pluggable entrypoint: `setStore()` / `STORAGE_MODULE` env var |
| `@storage/types`       | `types/`       | `StorageProvider` interface + related types                   |
| `@storage/fns`         | `fns/`         | Fills missing provider ops; sub-path exports per fn           |
| `@storage/test`        | `test/`        | `testStore(t, store, opts)` — shared test suite               |
| `@storage/util`        | `util/`        | Internal helpers; sub-path exports only                       |
| `@storage/deno-fs`     | `deno-fs/`     | Deno FS backend                                               |
| `@storage/deno-kv`     | `deno-kv/`     | Deno KV backend; sub-path exports for `get-deno-kv` and types |
| `@storage/deno-kv-fs`  | `deno-kv-fs/`  | Read-only FS + writable KV (`STORE_PRIMARY=kv` flips)         |
| `@storage/node-fs`     | `node-fs/`     | `node:fs` backend                                             |
| `@storage/web-storage` | `web-storage/` | Browser `localStorage`                                        |
| `@storage/no-op`       | `no-op/`       | Readonly null impl (only `url()`)                             |
| `@storage/in-memory`   | `in-memory/`   | In-memory Map (supports `expireIn`)                           |
| `@storage/bench`       | `bench/`       | Benchmarks run via `deno task bench`                          |

## Key types

- **`StorageKey`**: `readonly (string | number | boolean)[]` — hierarchical key
  arrays, not strings.
- **`StorageProvider`**: providers export individual functions, not a class.
  Each file starts with `({...} satisfies StorageProvider)`.

## Conventions

- **`satisfies StorageProvider`**: every provider uses this pattern at module
  top to validate their surface without widening the type.
- **`export type *`**: types package uses `export type * from "./..."` —
  required by `verbatimModuleSyntax`.
- **Sub-path exports**: `@storage/fns/batch`, `@storage/fns/set-item`, etc.
  `@storage/util` has `./key-string`, `./default-commit`, `./async-filter`,
  `./unique-key-filter` (no top-level `"."` re-export). `@storage/deno-kv` has
  `./get-deno-kv` and `./types`.
- **`--unstable-kv`** required for KV tests (set in root `deno.json`).

## Environment variables

| Var              | Used by              | Effect                                  |
| ---------------- | -------------------- | --------------------------------------- |
| `STORAGE_MODULE` | `main/`              | Default delegate store import specifier |
| `STORE_FS_ROOT`  | `deno-fs`, `node-fs` | Overrides `.store/` default storage dir |
| `STORE_KV_PATH`  | `deno-kv`            | KV db path (`undefined` = in-memory)    |
| `STORE_PRIMARY`  | `deno-kv-fs`         | Set to `kv` to prefer KV over FS        |

## Testing

- `testStore(t, store, opts)` from `@storage/test` runs the full suite against
  any provider. Options: `urlIncludes`, `readonly`, `orderedByKey`,
  `batchAtomic`, `extraTests`.
- Each provider has `store.test.ts` — run with `deno test <dir>/`
- KV and web-storage pass `orderedByKey: true`
- KV and deno-kv-fs pass `batchAtomic: [undefined, "preferred"]`
- `main/store.test.ts` tests delegation via env var, `setStore()`, and prefix
  routing
- Tests write to `.store/` (gitignored) — ensure clean before runs
- Always `close()` stores after tests to avoid leakage

## Config quirks

- Compiler: `noUncheckedIndexedAccess`, `verbatimModuleSyntax`,
  `erasableSyntaxOnly`
- `.store/` in `.gitignore`
- VSCode: `denoland.vscode-deno`, 2-space tabs
