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

Each function takes a hierarchy key as an array of strings. It's up to the
storage module how those are translated to the underlying storage. But it may be
best to assume the first level key to be a grouping level, eg. a database name.

Any JSON serializable value can be stored.

### `isWritable(key?: string[]) => Promise<boolean>`

Check whether the storage is writable in general, or at or below a particular
key.

### `getItem<T>(key: string[]) => Promise<T | undefined>`

Fetch an item from the storage.

### `setItem<T>(key: string[], value: T) => Promise<void>`

Set an item in storage.

### `removeItem<T>(key: string[]) => Promise<void>`

Remove an item, returns true if removed, or false if not.

### `listItems<T>(key?: string[]) => AsyncIterable<[string[], T]>`

List all items beneath the given key.

## Modules

### web_storage.ts

This uses `localStorage` of the standard
[Web Storage](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API)
API.

The parts of the key are joined with a `/` to form a single key string for use
with the `localStorage` API.

Import mapping: `"$store": "https://deno.land/x/storage_modules/web_storage.ts"`

### filesystem.ts

This stores values in individual files under a directory hierarchy via
[Deno fs](https://deno.land/api?s=Deno.readTextFile) calls. By default this is
under a `.store` dir under the current working dir. This can be overridden via
the environment var `STORE_ROOT`.

Each level of the key become a directory up to the last segment which become a
JSON file.

eg: `["one", "two", "three"]` -> `.store/one/two/three.json`

Import mapping: `"$store": "https://deno.land/x/storage_modules/filesystem.ts"`

## Future modules

Eventually we'll add modules to store in a remote database or KV store.
