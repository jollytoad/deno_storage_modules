import {
  assert,
  assertArrayIncludes,
  assertEquals,
  assertStringIncludes,
} from "@std/assert";
import type { StorageModule } from "./types.ts";

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

export async function testListItems(
  t: Deno.TestContext,
  { listItems }: StorageModule,
) {
  await t.step("listItems", async () => {
    const list = [
      100,
      "string",
      true,
      false,
      { one: 1 },
      ["a", "b", "c"],
      "number key",
      "true key",
      "false key",
    ];

    for await (const [_key, value] of listItems(["store"])) {
      assertArrayIncludes(list, [value]);
    }
  });
}

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

// if (storage_module === "deno_fs.ts") {
//   await t.step("empty folders are deleted from fs", async () => {
//     await setItem(["store", "deeply", "nested", "item"], true);

//     assert(
//       await exists(".store/store/deeply/nested"),
//       "Expected .store/store/deeply/nested folder to exist",
//     );

//     await removeItem(["store", "deeply", "nested", "item"]);

//     assert(
//       !await exists(".store/store"),
//       "Expected .store/store folder to no longer exist",
//     );
//   });
// }

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

export async function open(
  _t: Deno.TestContext,
  { hasItem, clearItems }: StorageModule,
) {
  // Just ensure that the underlying storage has been opened and is empty
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
