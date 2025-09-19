import {
  open,
  testIsWritable,
  testListItems,
  testSetItem,
  testUrl,
} from "@jollytoad/store-common/test-storage-module";
import * as store from "./mod.ts";

Deno.test("store-no-op", async (t) => {
  try {
    await open(t, store);
    await testUrl(t, store, "store-no-op");
    await testIsWritable(t, store, false);
    await testSetItem(t, store);
    await testListItems(t, store, []);
  } finally {
    await store.close();
  }
});
