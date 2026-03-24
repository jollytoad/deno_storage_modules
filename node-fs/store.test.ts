import { assert } from "@std/assert";
import { testStore } from "@storage/test";
import * as store from "./mod.ts";
import type { StorageProvider } from "@storage/types";
import { exists } from "@std/fs/exists";
import { removeItem, setItem } from "@storage/fns";

Deno.test("@storage/node-fs", async (t) => {
  await testStore(t, store, {
    urlIncludes: "node-fs",
    extraTests: [
      testDirectoryPurge,
    ],
  });
});

async function testDirectoryPurge(
  t: Deno.TestContext,
  store: StorageProvider,
) {
  await t.step("empty folders are deleted from fs", async () => {
    await setItem(store, ["store", "deeply", "nested", "item"], true);

    assert(
      await exists(".store/store/deeply/nested"),
      "Expected .store/store/deeply/nested folder to exist",
    );

    await removeItem(store, ["store", "deeply", "nested", "item"]);

    assert(
      !await exists(".store/store"),
      "Expected .store/store folder to no longer exist",
    );
  });
}
