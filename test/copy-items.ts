import type { StorageKey, StorageProvider } from "@storage/types";
import { assertArrayIncludes } from "@std/assert/array-includes";
import { clearItems } from "@storage/fns/clear-items";
import { canCopyItems, copyItems } from "@storage/fns/copy-items";
import { canGetItem, getItem } from "@storage/fns/get-item";
import { canHasItem, hasItem } from "@storage/fns/has-item";
import { canListItems, listValues } from "@storage/fns/list";
import { canSetItem, setItem } from "@storage/fns/set-item";
import { TEST_PREFIX } from "./fixtures.ts";
import { assert } from "@std/assert/assert";

/**
 * Test the {@linkcode copyItems} function of the given storage module.
 */
export async function testCopyItems(
  t: Deno.TestContext,
  store: StorageProvider,
  prefix: StorageKey = TEST_PREFIX,
) {
  await t.step({
    ignore: !canSetItem(store) || !canHasItem(store) ||
      !canGetItem(store) || !(canListItems(store) || canCopyItems(store)),
    name: "copyItems",
    fn: async () => {
      await setItem(store, [...prefix, "original"], "this");
      await setItem(store, [...prefix, "original", "number"], 100);
      await setItem(
        store,
        [...prefix, "original", "deeply", "true"],
        true,
      );
      await setItem(store, [...prefix, "original", "array"], [
        "a",
        "b",
        "c",
      ]);
      await setItem(store, [...prefix, "copied", "existing"], "here");

      await copyItems(store, [...prefix, "original"], [
        ...prefix,
        "copied",
      ]);

      assert(
        await hasItem(store, [...prefix, "original", "deeply", "true"]),
        "Expected deeply nested item to exist at old key",
      );

      assert(
        await hasItem(store, [...prefix, "copied", "deeply", "true"]),
        "Expected deeply nested item to exist at new key",
      );

      assert(
        !await hasItem(store, [...prefix, "copied", "existing"]),
        "Expected previous existing nested item to no longer exist at new key",
      );

      const expectedValues: unknown[] = ["this", 100, true, ["a", "b", "c"]];

      const originalValues = [
        await getItem(store, [...prefix, "original"]),
        ...await Array.fromAsync(
          listValues(store, [...prefix, "original"]),
        ),
      ];
      const copiedValues = [
        await getItem(store, [...prefix, "copied"]),
        ...await Array.fromAsync(listValues(store, [...prefix, "copied"])),
      ];

      assertArrayIncludes(
        originalValues,
        expectedValues,
        "Expected all items to be found at old key",
      );

      assertArrayIncludes(
        copiedValues,
        expectedValues,
        "Expected all items to be found at new key",
      );
    },
  });

  await t.step({
    ignore: !canSetItem(store) || !canHasItem(store) ||
      !canGetItem(store) || !(canListItems(store) || canCopyItems(store)),
    name: "copyItems (no item at prefix)",
    fn: async () => {
      // Only sub-items — no item at the source prefix itself
      await setItem(store, [...prefix, "parent", "child"], "a");
      await setItem(
        store,
        [...prefix, "parent", "deep", "grandchild"],
        true,
      );

      await copyItems(store, [...prefix, "parent"], [...prefix, "copy"]);

      assert(
        await hasItem(store, [...prefix, "parent", "deep", "grandchild"]),
        "Expected source sub-item to remain after copy",
      );

      assert(
        await hasItem(store, [...prefix, "copy", "deep", "grandchild"]),
        "Expected copied sub-item to exist at new prefix",
      );

      assert(
        (await getItem(store, [...prefix, "parent"])) === undefined,
        "Expected no item at source prefix after copy",
      );

      assert(
        (await getItem(store, [...prefix, "copy"])) === undefined,
        "Expected no item at destination prefix after copy",
      );

      const copied = [
        ...await Array.fromAsync(listValues(store, [...prefix, "copy"])),
      ];
      assertArrayIncludes(copied, ["a", true]);
    },
  });

  await t.step("copyItems (clean up)", async () => {
    await clearItems(store, [...prefix, "original"]);
    await clearItems(store, [...prefix, "copied"]);
    await clearItems(store, [...prefix, "copy"]);
  });
}
