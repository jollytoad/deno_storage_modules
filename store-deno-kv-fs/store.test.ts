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
} from "../store-common/test-storage-module.ts";
import * as store from "./mod.ts";

Deno.test("store-deno-kv-fs", async (t) => {
  try {
    await open(t, store);
    await testUrl(t, store, "store-deno-kv-fs");
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
