import type { StorageKey, StorageProvider } from "@storage/types";
import { TEST_ITEMS } from "./fixtures.ts";
import { canHasItem, hasItem } from "@storage/fns/has-item";
import { assert } from "@std/assert/assert";

/**
 * Test the {@linkcode hasItem} function of the given storage module,
 * this must be called after {@linkcode testSetItem}.
 */
export async function testHasItem(
  t: Deno.TestContext,
  store: StorageProvider,
  keys: Iterable<StorageKey> = TEST_ITEMS.keys(),
) {
  await t.step({
    ignore: !canHasItem(store),
    name: "hasItem",
    fn: async () => {
      for (const key of keys) {
        assert(await hasItem(store, key));
      }
    },
  });
}
