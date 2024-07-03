import { assertRejects } from "@std/assert";
import {
  open,
  testClearItems,
  testGetItem,
  testHasItem,
  testListItems,
  testRemoveItem,
  testSetItem,
  testUrl,
} from "../store-common/test-storage-module.ts";
import * as store from "./mod.ts";

Deno.test("store - via STORAGE_MODULE", async (t) => {
  try {
    Deno.env.set(
      "STORAGE_MODULE",
      import.meta.resolve("../store-web-storage/mod.ts"),
    );

    // clear the store implementation, so it gets picked up by the env var
    store.setStore();

    await open(t, store);
    await testUrl(t, store, "store-web-storage");
    await testSetItem(t, store);
    await testHasItem(t, store);
    await testGetItem(t, store);
    await testListItems(t, store);
    await testRemoveItem(t, store);
    await testClearItems(t, store);
  } finally {
    await store.close();
  }
});

Deno.test("store - via setStore()", async (t) => {
  try {
    Deno.env.delete("STORAGE_MODULE");

    store.setStore(import("../store-deno-kv/mod.ts"));

    await open(t, store);
    await testUrl(t, store, "store-deno-kv");
    await testSetItem(t, store);
    await testHasItem(t, store);
    await testGetItem(t, store);
    await testListItems(t, store);
    await testRemoveItem(t, store);
    await testClearItems(t, store);
  } finally {
    await store.close();
  }
});

Deno.test("store - no store selected throws an error", async () => {
  Deno.env.delete("STORAGE_MODULE");

  store.setStore();

  await assertRejects(
    () => store.getStore(),
    Error,
    "A StorageModule was not selected",
  );
});
