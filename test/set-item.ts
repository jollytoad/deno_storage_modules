import type { StorageKey, StorageProvider } from "@storage/types";
import { TEST_ITEMS } from "./fixtures.ts";
import { canSetItem, setItem } from "@storage/fns/set-item";

/**
 * Test the setItem() function of the given storage module.
 */
export async function testSetItem(
  t: Deno.TestContext,
  store: StorageProvider,
  items: Iterable<[StorageKey, unknown]> = TEST_ITEMS,
) {
  await t.step({
    ignore: !canSetItem(store),
    name: "setItem",
    fn: async () => {
      // TODO: spy

      for (const [key, value] of items) {
        await setItem(store, [...key], value);
      }
    },
  });
}
