import {
  close,
  getItem,
  hasItem,
  listItems,
  removeItem,
  setItem,
} from "$store";
import {
  assert,
  assertArrayIncludes,
  assertEquals,
} from "https://deno.land/std@0.182.0/testing/asserts.ts";

await Deno.test("storage", async (t) => {
  await t.step("setItem", async () => {
    await setItem(["store", "number"], 100);
    await setItem(["store", "string"], "string");
    await setItem(["store", "true"], true);
    await setItem(["store", "false"], false);
    await setItem(["store", "object"], { one: 1 });
    await setItem(["store", "array"], ["a", "b", "c"]);
    await close();
  });

  await t.step("hasItem", async () => {
    assert(await hasItem(["store", "number"]));
    assert(await hasItem(["store", "string"]));
    assert(await hasItem(["store", "true"]));
    assert(await hasItem(["store", "false"]));
    assert(await hasItem(["store", "object"]));
    assert(await hasItem(["store", "array"]));
    await close();
  });

  await t.step("getItem", async () => {
    assertEquals(await getItem(["store", "number"]), 100);
    assertEquals(await getItem(["store", "string"]), "string");
    assertEquals(await getItem(["store", "true"]), true);
    assertEquals(await getItem(["store", "false"]), false);
    assertEquals(await getItem(["store", "object"]), { one: 1 });
    assertEquals(await getItem(["store", "array"]), ["a", "b", "c"]);
    await close();
  });

  await t.step("listItems", async () => {
    const list = [100, "string", true, false, { one: 1 }, ["a", "b", "c"]];

    for await (const [_key, value] of listItems(["store"])) {
      assertArrayIncludes(list, [value]);
    }
    await close();
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

    assertEquals(count, 0);

    await close();
  });
});
