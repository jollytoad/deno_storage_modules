import type { StorageKey, StorageProvider } from "@storage/types";
import { TEST_ITEMS, TEST_PREFIX } from "./fixtures.ts";
import {
  canListItems,
  canListKeys,
  canListValues,
  listItems,
  listKeys,
  listValues,
} from "@storage/fns/list";
import { assertArrayIncludes } from "@std/assert/array-includes";

/**
 * Test the {@linkcode listItems}, {@linkcode listValues} and
 * {@linkcode listKeys} functions of the given storage module,
 * this must be called after {@linkcode testSetItem}.
 */
export async function testListItems(
  t: Deno.TestContext,
  store: StorageProvider,
  items: Iterable<[StorageKey, unknown]> = TEST_ITEMS,
  prefix: StorageKey = TEST_PREFIX,
) {
  await t.step({
    ignore: !canListItems(store),
    name: "listItems",
    fn: async () => {
      const list = Array.from(items);
      for await (const item of listItems(store, prefix)) {
        assertArrayIncludes(list, [item]);
      }
    },
  });

  await t.step({
    ignore: !canListValues(store),
    name: "listValues",
    fn: async () => {
      const values = Array.from(items).map(([_key, value]) => value);
      for await (const item of listValues(store, prefix)) {
        assertArrayIncludes(values, [item]);
      }
    },
  });

  await t.step({
    ignore: !canListKeys(store),
    name: "listKeys",
    fn: async () => {
      const keys = Array.from(items).map(([key, _value]) => [...key]);
      for await (const item of listKeys(store, prefix)) {
        assertArrayIncludes(keys, [item]);
      }
    },
  });
}
