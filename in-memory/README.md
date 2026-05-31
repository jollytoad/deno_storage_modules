# In-Memory Storage Provider

See [@storage/main](https://jsr.io/@storage/main) for the bigger picture.

This package provides an implementation of the `StorageProvider` interface.

This stores values in a `Map` in memory. The key parts are joined with a null
byte (`\0`) to form a single key string. Supports the `expireIn` option via
`setTimeout`. All data is cleared on `close()`.

**Example**

```ts
import * as store from "jsr:@storage/in-memory";
import { assertEquals } from "jsr:@std/assert";

await store.setItem(["foo", "hello"], "world");

assertEquals(await store.hasItem(["foo", "hello"]), true);
assertEquals(await store.getItem(["foo", "hello"]), "world");

await store.clearItems(["foo"]);
assertEquals(await store.hasItem(["foo", "hello"]), false);
```
