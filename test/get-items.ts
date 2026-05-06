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
      const keys = keysOf(items);
      const foundItems = await Array.fromAsync(getItems(store, keys));
      const expectedItems = Array.from(items);
      assertArrayIncludes(foundItems, expectedItems);
      assertEquals(foundItems.length, expectedItems.length);
    },
  });

  await t.step({
    ignore: !canGetItems(store),
    name: "getItems - duplicate keys are ignored",
    fn: async () => {
      const keys = [...keysOf(items), ...keysOf(items)];
      const foundItems = await Array.fromAsync(getItems(store, keys));
      const expectedItems = Array.from(items);
      assertArrayIncludes(foundItems, expectedItems);
      assertEquals(foundItems.length, expectedItems.length);
    },
  });
}

function keysOf(items: Iterable<[StorageKey, unknown]>): StorageKey[] {
  return Array.from(items).map(([key, _value]) => [...key]);
}
