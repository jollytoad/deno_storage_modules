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
import { exists } from "https://deno.land/std@0.182.0/fs/exists.ts";
import { basename } from "https://deno.land/std@0.182.0/path/posix.ts";
import {
  assert,
  assertArrayIncludes,
  assertEquals,
} from "https://deno.land/std@0.182.0/testing/asserts.ts";
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
    await setItem(["store", "true"], true);
    await setItem(["store", "false"], false);
    await setItem(["store", "object"], { one: 1 });
    await setItem(["store", "array"], ["a", "b", "c"]);
  });

  await t.step("hasItem", async () => {
    assert(await hasItem(["store", "number"]));
    assert(await hasItem(["store", "string"]));
    assert(await hasItem(["store", "true"]));
    assert(await hasItem(["store", "false"]));
    assert(await hasItem(["store", "object"]));
    assert(await hasItem(["store", "array"]));
  });

  await t.step("getItem", async () => {
    assertEquals(await getItem(["store", "number"]), 100);
    assertEquals(await getItem(["store", "string"]), "string");
    assertEquals(await getItem(["store", "true"]), true);
    assertEquals(await getItem(["store", "false"]), false);
    assertEquals(await getItem(["store", "object"]), { one: 1 });
    assertEquals(await getItem(["store", "array"]), ["a", "b", "c"]);
  });

  await t.step("listItems", async () => {
    const list = [100, "string", true, false, { one: 1 }, ["a", "b", "c"]];

    for await (const [_key, value] of listItems(["store"])) {
      assertArrayIncludes(list, [value]);
    }
  });

  await t.step("removeItem", async () => {
    await removeItem(["store", "number"]);
    await removeItem(["store", "string"]);
    await removeItem(["store", "true"]);
    await removeItem(["store", "false"]);
    await removeItem(["store", "object"]);
    await removeItem(["store", "array"]);

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
