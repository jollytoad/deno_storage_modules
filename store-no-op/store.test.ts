import {
  open,
  testIsWriteable,
  testListItems,
  testSetItem,
  testUrl,
} from "../store-common/test-storage-module.ts";
import * as store from "./mod.ts";

Deno.test("store-no-op", async (t) => {
  try {
    await open(t, store);
    await testUrl(t, store, "store-no-op");
    await testIsWriteable(t, store, false);
    await testSetItem(t, store);
    await testListItems(t, store, []);
  } finally {
    await store.close();
  }
});
