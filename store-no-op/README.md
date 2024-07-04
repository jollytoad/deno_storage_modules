# No-op Storage Module

See [@jollytoad/store](https://jsr.io/@jollytoad/store) for the bigger picture.

This package provides an implementation of the storage module interface.

This is a readonly no-op implementation of the storage interface.

Import mapping: `"$store": "jsr:@jollytoad/store-no-op"`

**Example**

```ts
import * as store from "jsr:@jollytoad/store-no-op";
import { assertEquals } from "jsr:@std/assert";

await store.setItem(["foo", "hello"], "world");

assertEquals(await store.hasItem(["foo", "hello"]), false);
```
