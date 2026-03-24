# Storage functions for Pluggable Storage Modules

See [@storage/main](https://jsr.io/@storage/main) for the bigger picture.

This package provides the complete set of Storage functions that delegate to a
given Storage provider, filling in any functionality that the provider doesn't
natively implement.

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
} from "@storage/common/test-storage-module";

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
    // This is optional, depending on your store
    await store.close();
  }
});
```
