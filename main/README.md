# Pluggable Storage Modules

This package provides a pluggable hierarchical key -> value storage mechanism.

Supported underlying mechanisms:

- Filesystem (via Deno functions)
- Web Storage (`localStorage`)
- Deno KV

You can use this particular package to allow dynamic switching of the
implementation, either via function call at the start of your app or via a
environment variable.

Alternatively you can use one of the implementation packages directly, or
aliased via your import map.

## Via import map

Map one of the implementations to a bare module specifier:

```json
{
  "imports": {
    "$store": "jsr:@storage/deno-fs"
  }
}
```

and then just import it:

```ts
import { setItem } from "$store";

await setItem(["store", "hello"], "world");
```

You can switch your implementation simply by changing what `$store` maps to in
the import map.

(btw, you can choose whatever alias you like, it doesn't have to be `$store`)

## Via initialization function

```ts
import { setStore } from "jsr:@storage/main";
import * as store from "jsr:@storage/deno-fs";

setStore(store);
```

or even via dynamic import (no need to await the import):

```ts
import { setStore } from "jsr:@storage/main";

setStore(import("jsr:@storage/deno-fs"));
```

and then use the functions from `jsr:@storage/main`:

```ts
import { setItem } from "jsr:@storage/main";

await setItem(["store", "hello"], "world");
```

### Delegate to multiple stores

You can also set a different storage implementation for a top-level key prefix:

```ts
import { setStore } from "jsr:@storage/main";
import * as fsStore from "jsr:@storage/deno-fs";
import * as kvStore from "jsr:@storage/deno-kv";

setStore(fsStore, "store1");
setStore(kvStore, "store1");

await setItem(["store1", "hello"], "world"); // stores in the filesystem
await setItem(["store2", "hello"], "world"); // stores in Deno KV
```

## Via environment variable

Set the `STORAGE_MODULE` environment variable to the URL of the preferred
storage module.

```sh
STORAGE_MODULE=jsr:@storage/deno-fs deno run --allow-env --allow-net ...
```

and then use the functions from `jsr:@storage/main`:

```ts
import { setItem } from "jsr:@storage/main";

await setItem(["store", "hello"], "world");
```

## Why a Module and not a Class?

Exposing the storage functions via a module allows you to just import it and use
it wherever you need it, there is no need for any dependency injection
mechanism.

In fact, you could consider the import map to be the dependency injection.

## Functions

Each function takes a hierarchical key as an array of strings. It's up to the
storage module how those are translated to the underlying storage. But it may be
best to assume the first level key to be a grouping level, eg. a database name.

Any JSON serializable value can be stored.

Here is a quick overview of the main functions, they deliberately follow a
naming scheme similar to the standard
[Web Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API):

- `setItem(key, value, options?)` - set the value for the exact key in the store
- `hasItem(key)` - whether a value at the exact key has been set
- `getItem(key)` - get the value at the exact key
- `listItems(prefix, options?)` - iterates over the items that match the key
  prefix
- `removeItem(key)` - delete the value for the exact key (ie. not any sub-items)
- `clearItems(prefix)` - deletes all items that match the key prefix (ie. an
  item and sub-items recursively)

The `options` of `setItem` allows specifying of an expiry time (if the
underlying store supports it).

The `options` of `listItems` allow reversing of the results (if the underlying
store supports it), and adjustment of page size for storage mechanism that fetch
via paged requests.

The following are extended functions, that a storage module may optionally
implement:

- `copyItems(fromKey, toKey)` - copy an item and all sub-items to the new key
  clearing any items and sub-items that already existed at the target key
- `moveItems(fromKey, toKey)` - move an item and all sub-items to the new key
  clearing any items and sub-items that already existed at the target key

These optional functions are always available from `@storage/main`, using a
default implementation if the delegate storage module doesn't provide it.

See the [types](https://jsr.io/@storage/common/doc/types/~) for a description of
all the functions in the module interface.

**Example**

```ts
import * as store from "jsr:@storage/deno-fs";
import { assertEquals } from "jsr:@std/assert";

await store.setItem(["foo", "hello"], "world");

assertEquals(await store.hasItem(["foo", "hello"]), true);
assertEquals(await store.getItem(["foo", "hello"]), "world");

await store.clearItems(["foo"]);
assertEquals(await store.hasItem(["foo", "hello"]), false);
```

You can swap the imported module for any of the alternative implementations,
`"jsr:@storage/deno-kv"`, or `"jsr:@storage/web-storage"` for example.

## Modules

### [@storage/web-storage](https://jsr.io/@storage/web-storage)

This uses `localStorage` of the standard
[Web Storage](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API)
API.

The parts of the key are joined with a `/` to form a single key string for use
with the `localStorage` API.

Import mapping: `"$store": "jsr:@storage/web-storage"`

### [@storage/deno-fs](https://jsr.io/@storage/deno-fs)

This stores values in individual files under a directory hierarchy via
[Deno fs](https://deno.land/api?s=Deno.readTextFile) calls. By default this is
under a `.store` dir under the current working dir. This can be overridden via
the environment var `STORE_FS_ROOT`.

Each level of the key becomes a directory up to the last segment which becomes a
JSON file.

eg: `["one", "two", "three"]` -> `.store/one/two/three.json`

Import mapping: `"$store": "jsr:@storage/deno-fs"`

### [@storage/node-fs](https://jsr.io/@storage/node-fs)

This is pretty much the same as `@storage/deno-fs` but uses `node:fs` API
instead of `Deno`, and so will work in Node.js, Deno, and Bun.

### [@storage/deno-kv](https://jsr.io/@storage/deno-kv)

Uses the [Deno KV](https://docs.deno.com/deploy/kv/manual) API for storage.

Import mapping: `"$store": "jsr:@storage/deno-kv"`

### [@storage/deno-kv-fs](https://jsr.io/@storage/deno-kv-fs)

Combination of a readonly `deno-fs` and writeable `deno-kv`, allowing fallback
or immutable storage in the filesystem, and mutable storage via the KV store.

By default the filesystem takes priority, and cannot be overridden by KV values,
unless the env var `STORE_PRIMARY` is set to `kv`, in which case the KV always
overrides filesystem values.

Import mapping: `"$store": "jsr:@storage/deno-kv-fs"`

### [@storage/no-op](https://jsr.io/@storage/no-op)

For the odd occasion when you want to disable storage entirely but not break
your app. This implementation does nothing.

### Bring your own

If these don't fulfil your needs then you can implement your own storage module
based on the
[StorageModule interface](https://jsr.io/@storage/common/doc/types/~/StorageModule),
and switch to it.

See the existing implementations for inspiration...

- [web-storage](https://github.com/jollytoad/deno_storage_modules/blob/main/web-storage/mod.ts)
- [deno-fs](https://github.com/jollytoad/deno_storage_modules/blob/main/deno-fs/mod.ts)
- [node-fs](https://github.com/jollytoad/deno_storage_modules/blob/main/node-fs/mod.ts)
- [deno-kv](https://github.com/jollytoad/deno_storage_modules/blob/main/deno-kv/mod.ts)
- [deno-kv-fs](https://github.com/jollytoad/deno_storage_modules/blob/main/deno-kv-fs/mod.ts)
- [no-op](https://github.com/jollytoad/deno_storage_modules/blob/main/no-op/mod.ts)
