// deno-lint-ignore-file no-explicit-any require-await
import type { ListItemsOptions, StorageKey } from "@storage/types";
import { listItems, listKeys, listValues } from "./list.ts";
import { assertEquals } from "@std/assert/equals";

async function url(): Promise<string> {
  return import.meta.url;
}

async function* listItemsMock(
  _prefix: StorageKey,
  _options?: ListItemsOptions,
): AsyncIterable<[StorageKey, any]> {
  yield [["test", "one"], 1];
  yield [["test", "two"], 2];
}

async function* listKeysMock(
  _prefix: StorageKey,
  _options?: ListItemsOptions,
): AsyncIterable<StorageKey> {
  yield ["test", "one"];
  yield ["test", "two"];
}

async function* listValuesMock(
  _prefix: StorageKey,
  _options?: ListItemsOptions,
): AsyncIterable<any> {
  yield 1;
  yield 2;
}

async function getItemMock(key: StorageKey): Promise<any> {
  switch (key[1]) {
    case "one":
      return 1;
    case "two":
      return 2;
    default:
      return undefined;
  }
}

const listItemsStore = {
  url,
  listItems: listItemsMock,
};

const listKeysStore = {
  url,
  listKeys: listKeysMock,
  getItem: getItemMock,
};

const listValuesStore = {
  url,
  listValues: listValuesMock,
};

Deno.test("listItems uses store.listItems", async () => {
  const items = await Array.fromAsync(listItems(listItemsStore, ["test"]));

  assertEquals(items, [[["test", "one"], 1], [["test", "two"], 2]]);
});

Deno.test("listItems falls back to store.listKeys and store.getItem", async () => {
  const items = await Array.fromAsync(listItems(listKeysStore, ["test"]));

  assertEquals(items, [[["test", "one"], 1], [["test", "two"], 2]]);
});

Deno.test("listKeys uses store.listKeys", async () => {
  const keys = await Array.fromAsync(listKeys(listKeysStore, ["test"]));

  assertEquals(keys, [["test", "one"], ["test", "two"]]);
});

Deno.test("listKeys falls back to store.listItems", async () => {
  const keys = await Array.fromAsync(listKeys(listItemsStore, ["test"]));

  assertEquals(keys, [["test", "one"], ["test", "two"]]);
});

Deno.test("listValues uses store.listValues", async () => {
  const values = await Array.fromAsync(listValues(listValuesStore, ["test"]));

  assertEquals(values, [1, 2]);
});

Deno.test("listValues falls back to store.listItems", async () => {
  const values = await Array.fromAsync(listValues(listItemsStore, ["test"]));

  assertEquals(values, [1, 2]);
});

Deno.test("listValues falls back to store.listKeys and store.getItem", async () => {
  const values = await Array.fromAsync(listValues(listKeysStore, ["test"]));

  assertEquals(values, [1, 2]);
});
