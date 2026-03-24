import type { StorageKey, StorageProvider } from "@storage/types";
import { assertEquals } from "@std/assert/equals";
import { canClearItems, clearItems } from "@storage/fns/clear-items";
import { canHasItem, hasItem } from "@storage/fns/has-item";
import { canListItems, listItems } from "@storage/fns/list";
import { canSetItem, setItem } from "@storage/fns/set-item";
import { TEST_PREFIX } from "./fixtures.ts";
import { assert } from "@std/assert/assert";

/**
 * Test the clearItems() function of the given storage module.
 */
export async function testClearItems(
  t: Deno.TestContext,
  store: StorageProvider,
  prefix: StorageKey = TEST_PREFIX,
) {
  await t.step({
    ignore: !canSetItem(store) || !canClearItems(store) || !canHasItem(store) ||
      !canListItems(store),
    name: "clearItems",
    fn: async () => {
      await setItem(store, [...prefix, "nested", "number"], 100);
      await setItem(store, [...prefix, "string"], "string");
      await setItem(store, [...prefix, "nested", "deeply", "true"], true);
      await setItem(store, [...prefix, "false"], false);
      await setItem(store, [...prefix, "object"], { one: 1 });
      await setItem(store, [...prefix, "array"], ["a", "b", "c"]);

      await clearItems(store, prefix);

      assert(
        !await hasItem(store, [...prefix, "nested", "deeply", "true"]),
        "Expected deeply nested item to no longer exist",
      );

      const items = await Array.fromAsync(listItems(store, prefix));

      assertEquals(items, [], "Expected no items to be found");
    },
  });
}
