# Web Storage Module

See [@jollytoad/store](https://jsr.io/@jollytoad/store) for the bigger picture.

This package provides an implementation of the storage module interface.

This uses `localStorage` of the standard
[Web Storage](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API)
API.

The parts of the key are joined with a `/` to form a single key string for use
with the `localStorage` API.

Import mapping: `"$store": "jsr:@jollytoad/store-web-storage"`

**Example**

```ts
import * as store from "jsr:@jollytoad/store-web-storage";
import { assertEquals } from "jsr:@std/assert";

await store.setItem(["foo", "hello"], "world");

assertEquals(await store.hasItem(["foo", "hello"]), true);
assertEquals(await store.getItem(["foo", "hello"]), "world");

await store.clearItems(["foo"]);
assertEquals(await store.hasItem(["foo", "hello"]), false);
```
