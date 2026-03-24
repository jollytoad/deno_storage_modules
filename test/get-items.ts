import type { StorageKey, StorageProvider } from "@storage/types";
import { canGetItems, getItems } from "@storage/fns/get-items";
import { assertArrayIncludes } from "@std/assert/array-includes";
import { TEST_ITEMS } from "./fixtures.ts";

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
      assertArrayIncludes(
        await Array.fromAsync(getItems(store, keys)),
        Array.from(items),
      );
    },
  });
}
