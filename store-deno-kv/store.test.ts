import {
  open,
  testClearItems,
  testCopyItems,
  testGetItem,
  testHasItem,
  testIsWritable,
  testListItems,
  testMoveItems,
  testOrdering,
  testRemoveItem,
  testSetItem,
  testUrl,
} from "@jollytoad/store-common/test-storage-module";
import * as store from "./mod.ts";

Deno.test("store-deno-kv", async (t) => {
  try {
    await open(t, store);
    await testUrl(t, store, "store-deno-kv");
    await testIsWritable(t, store);
    await testSetItem(t, store);
    await testHasItem(t, store);
    await testGetItem(t, store);
    await testListItems(t, store);
    await testRemoveItem(t, store);
    await testClearItems(t, store);
    await testCopyItems(t, store);
    await testMoveItems(t, store);
    await testOrdering(t, store);
  } finally {
    await store.close();
  }
});
