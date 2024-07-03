import { assert } from "@std/assert";
import {
  open,
  testClearItems,
  testGetItem,
  testHasItem,
  testIsWriteable,
  testListItems,
  testRemoveItem,
  testSetItem,
  testUrl,
} from "../store-common/test-storage-module.ts";
import * as store from "./mod.ts";
import { StorageModule } from "./mod.ts";
import { exists } from "@std/fs/exists";

Deno.test("store-deno-fs", async (t) => {
  try {
    await open(t, store);
    await testUrl(t, store, "store-deno-fs");
    await testIsWriteable(t, store);
    await testSetItem(t, store);
    await testHasItem(t, store);
    await testGetItem(t, store);
    await testListItems(t, store);
    await testRemoveItem(t, store);
    await testClearItems(t, store);
    await testDirectoryPurge(t, store);
    // Ordering is not currently supported on FS
    // await testOrdering(t, store);
  } finally {
    await store.close();
  }
});

export async function testDirectoryPurge(
  t: Deno.TestContext,
  { setItem, removeItem }: StorageModule,
) {
  await t.step("empty folders are deleted from fs", async () => {
    await setItem(["store", "deeply", "nested", "item"], true);

    assert(
      await exists(".store/store/deeply/nested"),
      "Expected .store/store/deeply/nested folder to exist",
    );

    await removeItem(["store", "deeply", "nested", "item"]);

    assert(
      !await exists(".store/store"),
      "Expected .store/store folder to no longer exist",
    );
  });
}
