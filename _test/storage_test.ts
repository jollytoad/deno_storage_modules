import {
  clearItems,
  close,
  getItem,
  hasItem,
  listItems,
  removeItem,
  setItem,
} from "$store";
import * as $store from "$store";
import { exists } from "https://deno.land/std@0.188.0/fs/exists.ts";
import { basename } from "https://deno.land/std@0.188.0/path/posix.ts";
import {
  assert,
  assertArrayIncludes,
  assertEquals,
} from "https://deno.land/std@0.188.0/testing/asserts.ts";
import type { StorageModule } from "../types.ts";

const storage_module = basename(
  new URL(import.meta.resolve("$store")).pathname,
);

$store satisfies StorageModule;

await Deno.test(`storage module: ${storage_module}`, async (t) => {
  await open();

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

    switch (storage_module) {
      case "deno_fs.ts":
        assert(
          !await exists(".store/store"),
          "Expected .store/store folder to no longer exist",
        );
    }
  });

  await close();
});

async function open() {
  // Just ensure that the underlying storage has been opened and is empty
  await hasItem(["store"]);
  await clearItems([]);
}
