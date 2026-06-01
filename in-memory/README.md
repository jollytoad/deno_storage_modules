# In-Memory Storage Provider

See [@storage/main](https://jsr.io/@storage/main) for the bigger picture.

This package provides an implementation of the `StorageProvider` interface.

Stores values in a tree of `Node` objects keyed by individual key segments. List
operations return results in **lexicographic key order** (booleans < numbers <
strings, each compared by natural order within its type). Supports
`ListItemsOptions.reverse` to invert the ordering. Also supports the `expireIn`
option via `setTimeout`. All data is cleared on `close()`.

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
