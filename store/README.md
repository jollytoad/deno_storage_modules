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
    "$store": "jsr:@jollytoad/store-deno-fs"
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
import { setStore } from "jsr:@jollytoad/store";
import * as store from "jsr:@jollytoad/store-deno-fs";

setStore(store);
```

or even via dynamic import (no need to await the import):

```ts
import { setStore } from "jsr:@jollytoad/store";

setStore(import("jsr:@jollytoad/store-deno-fs"));
```

and then use the functions from `jsr:@jollytoad/store`:

```ts
import { setItem } from "jsr:@jollytoad/store";

await setItem(["store", "hello"], "world");
```

## Via environment variable

Set the `STORAGE_MODULE` environment variable to the URL of the preferred
storage module.

_(TODO: Test whether `jsr:` specifiers work for the env var)_

```sh
STORAGE_MODULE=jsr:@jollytoad/store-deno-fs deno run --allow-env --allow-net ...
```

and then use the functions from `jsr:@jollytoad/store`:

```ts
import { setItem } from "jsr:@jollytoad/store";

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

See the [types](./store-common/types.ts) for a description of the module
interface.

## Modules

### [web-storage](https://jsr.io/@jollytoad/store-web-storage)

This uses `localStorage` of the standard
[Web Storage](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API)
API.

The parts of the key are joined with a `/` to form a single key string for use
with the `localStorage` API.

Import mapping: `"$store": "jsr:@jollytoad/store-web-storage"`

### [deno-fs](https://jsr.io/@jollytoad/store-deno-fs)

This stores values in individual files under a directory hierarchy via
[Deno fs](https://deno.land/api?s=Deno.readTextFile) calls. By default this is
under a `.store` dir under the current working dir. This can be overridden via
the environment var `STORE_FS_ROOT`.

Each level of the key becomes a directory up to the last segment which becomes a
JSON file.

eg: `["one", "two", "three"]` -> `.store/one/two/three.json`

Import mapping: `"$store": "jsr:@jollytoad/store-deno-fs"`

### [deno-kv](https://jsr.io/@jollytoad/store-deno-kv)

Uses the [Deno KV](https://deno.land/manual/runtime/kv) API for storage.

Import mapping: `"$store": "jsr:@jollytoad/store-deno-kv"`

### [deno-kv-fs](https://jsr.io/@jollytoad/store-deno-kv-fs)

Combination of a readonly `deno-fs` and writeable `deno-kv`, allowing fallback
or immutable storage in the filesystem, and mutable storage via the KV store.

By default the filesystem takes priority, and cannot be overridden by KV values,
unless the env var `STORE_PRIMARY` is set to `kv`, in which case the KV always
overrides filesystem values.

Import mapping: `"$store": "jsr:@jollytoad/store-deno-kv-fs"`

### [no-op](https://jsr.io/@jollytoad/store-no-op)

For the odd occasion when you want to disable storage entirely but not break
your app. This implementation does nothing.

### Bring your own

If these don't fulfil your needs then you can implement your own storage module
based on the [interface](./store-common/types.ts), and switch to it.

See the existing implementations for inspiration...

- [web-storage](./store-web-storage/mod.ts)
- [deno-fs](./store-deno-fs/mod.ts)
- [deno-kv](./store-deno-kv/mod.ts)
- [deno-kv-fs](./store-deno-kv-fs/mod.ts)
- [no-op](./store-no-op/mod.ts)
