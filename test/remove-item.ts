import type { StorageKey, StorageProvider } from "@storage/types";
import { TEST_ITEMS, TEST_PREFIX } from "./fixtures.ts";
import { canRemoveItem, removeItem } from "@storage/fns/remove-item";
import { assertEquals } from "@std/assert/equals";
import { assertFalse } from "@std/assert/false";
import { canHasItem, hasItem } from "@storage/fns/has-item";
import { canSetItem, setItem } from "@storage/fns/set-item";
import { assert } from "@std/assert/assert";

/**
 * Test the {@linkcode removeItem} function of the given storage module,
 * this must be called after {@linkcode testSetItem}.
 */
export async function testRemoveItem(
  t: Deno.TestContext,
  store: StorageProvider,
  keys: Iterable<StorageKey> = TEST_ITEMS.keys(),
  prefix: StorageKey = TEST_PREFIX,
) {
  await t.step({
    ignore: !canRemoveItem(store) || !canHasItem(store),
    name: "removeItem",
    fn: async () => {
      for (const key of keys) {
        await removeItem(store, key);
      }

      let count = 0;

      for (const key of keys) {
        if (await hasItem(store, key)) {
          count++;
        }
      }

      assertEquals(count, 0, "Expected no items to be found");
    },
  });

  await t.step({
    ignore: !canSetItem(store) || !canRemoveItem(store) || !canHasItem(store),
    name: "removeItem does not recurse",
    fn: async () => {
      await setItem(store, [...prefix, "nested", "item"], "here");

      await removeItem(store, [...prefix, "nested"]);

      assert(await hasItem(store, [...prefix, "nested", "item"]));
    },
  });

  await t.step({
    name: "clean up",
    fn: async () => {
      await removeItem(store, [...prefix, "nested", "item"]);
      assertFalse(await hasItem(store, [...prefix, "nested", "item"]));
    },
  });
}
