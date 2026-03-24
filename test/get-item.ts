import type { StorageKey, StorageProvider } from "@storage/types";
import { canGetItem, getItem } from "@storage/fns/get-item";
import { assertEquals } from "@std/assert/equals";
import { TEST_ITEMS } from "./fixtures.ts";

/**
 * Test the {@linkcode getItem} function of the given storage module,
 * this must be called after {@linkcode testSetItem}.
 */
export async function testGetItem(
  t: Deno.TestContext,
  store: StorageProvider,
  items: Iterable<[StorageKey, unknown]> = TEST_ITEMS,
) {
  await t.step({
    ignore: !canGetItem(store),
    name: "getItem",
    fn: async () => {
      for (const [key, value] of items) {
        assertEquals(await getItem(store, key), value);
      }
    },
  });
}
