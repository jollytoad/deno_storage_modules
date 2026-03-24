import type { StorageKey, StorageProvider } from "@storage/types";
import { TEST_PREFIX } from "./fixtures.ts";
import { canSetItem, setItem } from "@storage/fns/set-item";
import { listValues } from "@storage/fns/list";
import { assertEquals } from "@std/assert/equals";
import { clearItems } from "@storage/fns/clear-items";

/**
 * Test the storage module list items ordered by key,
 * and supports listing in reverse.
 * This test is optional for a storage module.
 */
export async function testOrdering(
  t: Deno.TestContext,
  store: StorageProvider,
  prefix: StorageKey = TEST_PREFIX,
) {
  await t.step({
    ignore: !canSetItem(store),
    name: "ordered items",
    fn: async (t) => {
      await t.step("populate list", async () => {
        await setItem(store, [...prefix, "ordered_list", 2], 2);
        await setItem(store, [...prefix, "ordered_list", 4], 4);
        await setItem(store, [...prefix, "ordered_list", 3], 3);
        await setItem(store, [...prefix, "ordered_list", 1], 1);
      });

      await t.step("in natural order", async () => {
        const values = await Array.fromAsync(
          listValues<number>(store, [...prefix, "ordered_list"]),
        );
        assertEquals(values, [1, 2, 3, 4]);
      });

      await t.step("in reverse order", async () => {
        const values = await Array.fromAsync(
          listValues<number>(store, [...prefix, "ordered_list"], {
            reverse: true,
          }),
        );
        assertEquals(values, [4, 3, 2, 1]);
      });

      await t.step("delete list", async () => {
        await clearItems(store, [...prefix, "ordered_list"]);
      });
    },
  });
}
