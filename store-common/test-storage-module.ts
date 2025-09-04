import {
  assert,
  assertArrayIncludes,
  assertEquals,
  assertStringIncludes,
} from "@std/assert";
import type { DelegatedStore, StorageModule } from "./types.ts";
import { copyItems } from "./copy-items.ts";
import { moveItems } from "./move-items.ts";

/**
 * Test the url() function of the given storage module.
 */
export async function testUrl(
  t: Deno.TestContext,
  { url }: StorageModule,
  includes: string,
) {
  await t.step(`url contains "${includes}"`, async () => {
    const actualUrl = await url();
    console.log("StorageModule URL:", actualUrl);
    assertStringIncludes(actualUrl, includes);
  });
}

/**
 * Test the url() function of the given delegated storage module with a key prefix.
 */
export async function testUrlForPrefix(
  t: Deno.TestContext,
  { url }: DelegatedStore,
  includes: string,
  prefix: string,
) {
  await t.step(
    `url contains "${includes}" for keys prefixed with "${prefix}"`,
    async () => {
      const actualUrl = await url(prefix);
      console.log("StorageModule URL:", actualUrl);
      assertStringIncludes(actualUrl, includes);
    },
  );
}

/**
 * Test the isWriteable() function of the given storage module.
 */
export async function testIsWriteable(
  t: Deno.TestContext,
  { isWritable }: StorageModule,
  expected = true,
  prefix?: string,
) {
  await t.step(
    `isWriteable(${prefix ? `["${prefix}"]` : ""}) to be ${expected}`,
    async () => {
      assertEquals(await isWritable(prefix ? [prefix] : undefined), expected);
    },
  );
}

/**
 * Test the setItem() function of the given storage module.
 */
export async function testSetItem(
  t: Deno.TestContext,
  { setItem }: StorageModule,
) {
  await t.step("setItem", async () => {
    await setItem(["store", "number"], 100);
    await setItem(["store", "string"], "string");
    await setItem(["store", "true_"], true);
    await setItem(["store", "false_"], false);
    await setItem(["store", "object"], { one: 1 });
    await setItem(["store", "array"], ["a", "b", "c"]);
    await setItem(["store", 123], "number key");
    await setItem(["store", true], "true key");
    await setItem(["store", false], "false key");
  });
}

/**
 * Test the hasItem() function of the given storage module,
 * this must be called after `testSetItem`.
 */
export async function testHasItem(
  t: Deno.TestContext,
  { hasItem }: StorageModule,
) {
  await t.step("hasItem", async () => {
    assert(await hasItem(["store", "number"]));
    assert(await hasItem(["store", "string"]));
    assert(await hasItem(["store", "true_"]));
    assert(await hasItem(["store", "false_"]));
    assert(await hasItem(["store", "object"]));
    assert(await hasItem(["store", "array"]));
    assert(await hasItem(["store", 123]));
    assert(await hasItem(["store", true]));
    assert(await hasItem(["store", false]));
  });
}

/**
 * Test the getItem() function of the given storage module,
 * this must be called after `testSetItem`.
 */
export async function testGetItem(
  t: Deno.TestContext,
  { getItem }: StorageModule,
) {
  await t.step("getItem", async () => {
    assertEquals(await getItem(["store", "number"]), 100);
    assertEquals(await getItem(["store", "string"]), "string");
    assertEquals(await getItem(["store", "true_"]), true);
    assertEquals(await getItem(["store", "false_"]), false);
    assertEquals(await getItem(["store", "object"]), { one: 1 });
    assertEquals(await getItem(["store", "array"]), ["a", "b", "c"]);
    assertEquals(await getItem(["store", 123]), "number key");
    assertEquals(await getItem(["store", true]), "true key");
    assertEquals(await getItem(["store", false]), "false key");
  });
}

/**
 * Test the listItems() function of the given storage module,
 * this must be called after `testSetItem`.
 */
export async function testListItems(
  t: Deno.TestContext,
  { listItems }: StorageModule,
  list = [
    100,
    "string",
    true,
    false,
    { one: 1 },
    ["a", "b", "c"],
    "number key",
    "true key",
    "false key",
  ],
) {
  await t.step("listItems", async () => {
    for await (const [_key, value] of listItems(["store"])) {
      assertArrayIncludes(list, [value]);
    }
  });
}

/**
 * Test the removeItem() function of the given storage module,
 * this must be called after `testSetItem`.
 */
export async function testRemoveItem(
  t: Deno.TestContext,
  { removeItem, listItems, setItem, hasItem }: StorageModule,
) {
  await t.step("removeItem", async () => {
    await removeItem(["store", "number"]);
    await removeItem(["store", "string"]);
    await removeItem(["store", "true_"]);
    await removeItem(["store", "false_"]);
    await removeItem(["store", "object"]);
    await removeItem(["store", "array"]);
    await removeItem(["store", 123]);
    await removeItem(["store", true]);
    await removeItem(["store", false]);

    let count = 0;

    for await (const _item of listItems(["store"])) {
      count++;
    }

    assertEquals(count, 0, "Expected no items to be found");
  });

  await t.step("removeItem does not recurse", async () => {
    await setItem(["store", "nested", "item"], "here");

    await removeItem(["store", "nested"]);

    assert(await hasItem(["store", "nested", "item"]));
  });
}

/**
 * Test the clearItems() function of the given storage module.
 */
export async function testClearItems(
  t: Deno.TestContext,
  { clearItems, setItem, hasItem, listItems }: StorageModule,
) {
  await t.step("clearItems", async () => {
    await setItem(["store", "nested", "number"], 100);
    await setItem(["store", "string"], "string");
    await setItem(["store", "nested", "deeply", "true"], true);
    await setItem(["store", "false"], false);
    await setItem(["store", "object"], { one: 1 });
    await setItem(["store", "array"], ["a", "b", "c"]);

    await clearItems(["store"]);

    assert(
      !await hasItem(["store", "nested", "deeply", "true"]),
      "Expected deeply nested item to no longer exist",
    );

    let count = 0;

    for await (const _item of listItems(["store"])) {
      count++;
    }

    assertEquals(count, 0, "Expected no items to be found");
  });
}

/**
 * Test the copyItems() function of the given storage module.
 */
export async function testCopyItems(t: Deno.TestContext, store: StorageModule) {
  const { setItem, getItem, hasItem, listItems, clearItems } = store;

  await t.step("copyItems", async () => {
    await setItem(["store", "original"], "this");
    await setItem(["store", "original", "number"], 100);
    await setItem(["store", "original", "deeply", "true"], true);
    await setItem(["store", "original", "array"], ["a", "b", "c"]);

    await setItem(["store", "copied", "existing"], "here");

    if (store.copyItems) {
      await store.copyItems(["store", "original"], ["store", "copied"]);
    } else {
      await copyItems(["store", "original"], ["store", "copied"], store);
    }

    assert(
      await hasItem(["store", "original", "deeply", "true"]),
      "Expected deeply nested item to exist at old key",
    );

    assert(
      await hasItem(["store", "copied", "deeply", "true"]),
      "Expected deeply nested item to exist at new key",
    );

    assert(
      !await hasItem(["store", "copied", "existing"]),
      "Expected previous existing nested item to no longer exist at new key",
    );

    const expectedValues: unknown[] = ["this", 100, true, ["a", "b", "c"]];

    const originalValues = [
      await getItem(["store", "original"]),
      ...await gatherValues(listItems(["store", "original"])),
    ];
    const copiedValues = [
      await getItem(["store", "copied"]),
      ...await gatherValues(listItems(["store", "copied"])),
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
  });

  await t.step("copyItems (clean up)", async () => {
    await clearItems(["store", "original"]);
    await clearItems(["store", "copied"]);
  });
}

/**
 * Test the moveItems() function of the given storage module.
 */
export async function testMoveItems(t: Deno.TestContext, store: StorageModule) {
  const { setItem, getItem, hasItem, listItems, clearItems } = store;

  await t.step("moveItems", async () => {
    await setItem(["store", "original"], "this");
    await setItem(["store", "original", "number"], 100);
    await setItem(["store", "original", "deeply", "true"], true);
    await setItem(["store", "original", "array"], ["a", "b", "c"]);

    await setItem(["store", "moved", "existing"], "here");

    if (store.moveItems) {
      await store.moveItems(["store", "original"], ["store", "moved"]);
    } else {
      await moveItems(["store", "original"], ["store", "moved"], store);
    }

    assert(
      !await hasItem(["store", "original", "deeply", "true"]),
      "Expected deeply nested item to no longer exist at old key",
    );

    assert(
      await hasItem(["store", "moved", "deeply", "true"]),
      "Expected deeply nested item to exist at new key",
    );

    assert(
      !await hasItem(["store", "copied", "existing"]),
      "Expected previous existing nested item to no longer exist at new key",
    );

    assert(
      !await hasItem(["store", "original"]),
      "Expected root item to no longer exist at old key",
    );

    const originalSubValues = await gatherValues(
      listItems(["store", "original"]),
    );

    assertEquals(
      originalSubValues.length,
      0,
      "Expected no sub items to be found at old key",
    );

    const expectedValues = ["this", 100, true, ["a", "b", "c"]];

    const movedValues = [
      await getItem(["store", "moved"]),
      ...await gatherValues(listItems(["store", "moved"])),
    ];

    assertArrayIncludes(
      movedValues,
      expectedValues,
      "Expected all items to be found at new key",
    );
  });

  await t.step("moveItems (clean up)", async () => {
    await clearItems(["store", "original"]);
    await clearItems(["store", "moved"]);
  });
}

/**
 * Test the storage module list items ordered by key,
 * and supports listing in reverse.
 * This test is optional for a storage module.
 */
export async function testOrdering(
  t: Deno.TestContext,
  { setItem, listItems, removeItem }: StorageModule,
) {
  await t.step("ordered items", async (t) => {
    await t.step("populate list", async () => {
      await setItem(["store_list", 2], 2);
      await setItem(["store_list", 4], 4);
      await setItem(["store_list", 3], 3);
      await setItem(["store_list", 1], 1);
    });

    await t.step("in natural order", async () => {
      const values = await gatherValues(listItems(["store_list"]));
      assertEquals(values, [1, 2, 3, 4]);
    });

    await t.step("in reverse order", async () => {
      const values = await gatherValues(listItems(["store_list"], true));
      assertEquals(values, [4, 3, 2, 1]);
    });

    await t.step("delete list", async () => {
      await removeItem(["store_list"]);
    });
  });
}

/**
 * Ensure that the underlying storage has been opened and is empty
 */
export async function open(
  _t: Deno.TestContext,
  { hasItem, clearItems }: StorageModule,
) {
  await hasItem(["store"]);
  await clearItems([]);
}

async function gatherValues<T>(
  items: AsyncIterable<[unknown, T]>,
): Promise<T[]> {
  const result: T[] = [];
  for await (const [_key, value] of items) {
    result.push(value);
  }
  return result;
}
