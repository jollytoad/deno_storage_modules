# Test functions for Pluggable Storage Modules

See [@storage/main](https://jsr.io/@storage/main) for the bigger picture.

If you want to implement your own storage provider the test utils can help you
get started with some standard tests...

**Example test case**

```ts
import { testStore } from "@storage/test";

// This is your custom storage module
import * as store from "./mod.ts";

Deno.test("store-my-custom-storage", async (t) => {
  await testStore(t, store, {
    url: "store-my-custom-storage",
    orderedByKey: true,
  });
});
```
