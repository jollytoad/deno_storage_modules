import type { StorageKey, StorageProvider } from "@storage/types";
import { canGetItems, getItems } from "@storage/fns/get-items";
import { assertArrayIncludes } from "@std/assert/array-includes";
import { TEST_ITEMS } from "./fixtures.ts";
import { assertEquals } from "@std/assert/equals";

/**
 * Test the {@linkcode getItems} function of the given storage module,
 * this must be called after {@linkcode testSetItem}.
 */
export async function testGetItems(
  t: Deno.TestContext,
  store: StorageProvider,
  items: Iterable<[StorageKey, unknown]> = TEST_ITEMS,
) {
  await t.step({
    ignore: !canGetItems(store),
    name: "getItems",
    fn: async () => {
      const keys = Array.from(items).map(([key, _value]) => key);
      const foundItems = await Array.fromAsync(getItems(store, keys));
      const expectedItems = Array.from(items);
      assertArrayIncludes(foundItems, expectedItems);
      assertEquals(foundItems.length, expectedItems.length);
    },
  });

  await t.step({
    ignore: !canGetItems(store),
    name: "getItems - keys are deduplicated",
    fn: async () => {
      const keys = Array.from(items).map(([key, _value]) => key);
      const duplicateKeys = [...keys, ...keys];
      const foundItems = await Array.fromAsync(getItems(store, duplicateKeys));
      const expectedItems = Array.from(items);
      assertArrayIncludes(foundItems, expectedItems);
      assertEquals(foundItems.length, expectedItems.length);
    },
  });
}
