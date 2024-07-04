# Common types and utilities for Pluggable Storage Modules

See [@jollytoad/store](https://jsr.io/@jollytoad/store) for the bigger picture.

This package provides the storage module interface definition and some reusable
utility function for use by implementations.

- [the interface](./types.ts)
- [key conversion utils](./key-utils.ts)
- [test utils](./test-storage-module.ts)

## StorageModule

If you need to reference the interface for a storage module:

```ts
import type { StorageModule } from "jsr:@jollytoad/store-common/types";
```

## Test Utils

If you want to implement your own storage modules the test utils can help you
get started with some standard tests...

**Example test case**

```ts
import {
  open,
  testClearItems,
  testGetItem,
  testHasItem,
  testIsWriteable,
  testListItems,
  testOrdering,
  testRemoveItem,
  testSetItem,
  testUrl,
} from "@jollytoad/store-common/test-storage-module";

// This is your custom storage module
import * as store from "./mod.ts";

Deno.test("store-my-custom-storage", async (t) => {
  try {
    await open(t, store);
    await testUrl(t, store, "store-my-custom-storage");
    await testIsWriteable(t, store);
    await testSetItem(t, store);
    await testHasItem(t, store);
    await testGetItem(t, store);
    await testListItems(t, store);
    await testRemoveItem(t, store);
    await testClearItems(t, store);
    await testOrdering(t, store);
  } finally {
    await store.close();
  }
});
```
