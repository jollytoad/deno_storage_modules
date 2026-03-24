# No-op Storage Provider

See [@storage/main](https://jsr.io/@storage/main) for the bigger picture.

This package provides an implementation of the `StorageProvider` interface.

This is a readonly no-op implementation of the storage interface.

**Example**

```ts
import * as store from "jsr:@storage/no-op";
import { assertEquals } from "jsr:@std/assert";

await store.setItem(["foo", "hello"], "world");

assertEquals(await store.hasItem(["foo", "hello"]), false);
```
