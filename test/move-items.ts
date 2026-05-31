import type { StorageKey, StorageProvider } from "@storage/types";
import { assertArrayIncludes } from "@std/assert/array-includes";
import { assertEquals } from "@std/assert/equals";
import { clearItems } from "@storage/fns/clear-items";
import { canGetItem, getItem } from "@storage/fns/get-item";
import { canHasItem, hasItem } from "@storage/fns/has-item";
import { canListItems, listValues } from "@storage/fns/list";
import { canMoveItems, moveItems } from "@storage/fns/move-items";
import { canSetItem, setItem } from "@storage/fns/set-item";
import { TEST_PREFIX } from "./fixtures.ts";
import { assert } from "@std/assert/assert";

/**
 * Test the {@linkcode moveItems} function of the given storage module.
 */
export async function testMoveItems(
  t: Deno.TestContext,
  store: StorageProvider,
  prefix: StorageKey = TEST_PREFIX,
) {
  await t.step({
    ignore: !canSetItem(store) || !canHasItem(store) ||
      !canGetItem(store) || !(canMoveItems(store) || canListItems(store)),
    name: "moveItems",
    fn: async () => {
      await setItem(store, [...prefix, "original"], "this");
      await setItem(store, [...prefix, "original", "number"], 100);
      await setItem(
        store,
        [...prefix, "original", "deeply", "true"],
        true,
      );
      await setItem(store, [...prefix, "original", "array"], ["a", "b", "c"]);

      await setItem(store, [...prefix, "moved", "existing"], "here");

      await moveItems(store, [...prefix, "original"], [...prefix, "moved"]);

      assert(
        !await hasItem(store, [...prefix, "original", "deeply", "true"]),
        "Expected deeply nested item to no longer exist at old key",
      );

      assert(
        await hasItem(store, [...prefix, "moved", "deeply", "true"]),
        "Expected deeply nested item to exist at new key",
      );

      assert(
        !await hasItem(store, [...prefix, "copied", "existing"]),
        "Expected previous existing nested item to no longer exist at new key",
      );

      assert(
        !await hasItem(store, [...prefix, "original"]),
        "Expected root item to no longer exist at old key",
      );

      const originalSubValues = await Array.fromAsync(
        listValues(store, [...prefix, "original"]),
      );

      assertEquals(
        originalSubValues.length,
        0,
        "Expected no sub items to be found at old key",
      );

      const expectedValues = ["this", 100, true, ["a", "b", "c"]];

      const movedValues = [
        await getItem(store, [...prefix, "moved"]),
        ...await Array.fromAsync(listValues(store, [...prefix, "moved"])),
      ];

      assertArrayIncludes(
        movedValues,
        expectedValues,
        "Expected all items to be found at new key",
      );
    },
  });

  await t.step("moveItems (clean up)", async () => {
    await clearItems(store, [...prefix, "original"]);
    await clearItems(store, [...prefix, "moved"]);
  });
}
