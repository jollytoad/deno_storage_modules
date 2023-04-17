# Pluggable Storage Modules for Deno

NOTE: This is an experimental module.

Each module here provides the same interface to a hierarchical key -> value
storage mechanism. So they can be imported directly or as swappable interface
via an import map, for example:

```json
{
  "imports": {
    "$store": "https://deno.land/x/storage_modules/filesystem.ts"
  }
}
```

## Functions

Each function takes a hierarchical key as an array of strings. It's up to the
storage module how those are translated to the underlying storage. But it may be
best to assume the first level key to be a grouping level, eg. a database name.

Any JSON serializable value can be stored.

See the [types](./types.ts) for a description of the module interface.

## Modules

### web_storage.ts

This uses `localStorage` of the standard
[Web Storage](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API)
API.

The parts of the key are joined with a `/` to form a single key string for use
with the `localStorage` API.

Import mapping: `"$store": "https://deno.land/x/storage_modules/web_storage.ts"`

### deno_fs.ts

This stores values in individual files under a directory hierarchy via
[Deno fs](https://deno.land/api?s=Deno.readTextFile) calls. By default this is
under a `.store` dir under the current working dir. This can be overridden via
the environment var `STORE_FS_ROOT`.

Each level of the key becomes a directory up to the last segment which becomes a
JSON file.

eg: `["one", "two", "three"]` -> `.store/one/two/three.json`

Import mapping: `"$store": "https://deno.land/x/storage_modules/filesystem.ts"`

### deno_kv.ts

Use the [Deno KV](https://deno.land/manual/runtime/kv) API for storage.

Import mapping: `"$store": "https://deno.land/x/storage_modules/deno_kv.ts"`

### deno_kv_fs.ts

Combination of a readonly `deno_fs.ts` and `deno_kv.ts`, allowing fallback or
immutable storage in the filesystem, and mutable storage via the KV store.

By default the filesystem takes priority, and cannot be overridden by KV values,
unless the env var `STORE_PRIMARY` is set to `kv`, in which case the KV always
overrides filesystem values.
