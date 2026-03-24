import { assert } from "@std/assert";
import * as store from "./mod.ts";
import { exists } from "@std/fs/exists";
import type { StorageProvider } from "@storage/types";
import { removeItem, setItem } from "@storage/fns";
import { testStore } from "@storage/test";

Deno.test("@storage/deno-fs", async (t) => {
  await testStore(t, store, {
    urlIncludes: "deno-fs",
    extraTests: [
      testDirectoryPurge,
    ],
  });
});

async function testDirectoryPurge(
  t: Deno.TestContext,
  store: StorageProvider,
) {
  await t.step({
    name: "empty folders are deleted from fs",
    fn: async () => {
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
    },
  });
}
