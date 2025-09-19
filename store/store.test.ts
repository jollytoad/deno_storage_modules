import { assertRejects } from "@std/assert";
import {
  open,
  testClearItems,
  testCopyItems,
  testGetItem,
  testHasItem,
  testIsWritable,
  testListItems,
  testMoveItems,
  testRemoveItem,
  testSetItem,
  testUrl,
  testUrlForPrefix,
} from "@jollytoad/store-common/test-storage-module";
import * as store from "./mod.ts";

Deno.test("store - via STORAGE_MODULE", async (t) => {
  try {
    Deno.env.set(
      "STORAGE_MODULE",
      import.meta.resolve("@jollytoad/store-web-storage"),
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
    await testCopyItems(t, store);
    await testMoveItems(t, store);
  } finally {
    await store.close();
  }
});

Deno.test("store - via setStore()", async (t) => {
  try {
    Deno.env.delete("STORAGE_MODULE");

    store.setStore(import("@jollytoad/store-deno-kv"));

    await open(t, store);
    await testUrl(t, store, "store-deno-kv");
    await testSetItem(t, store);
    await testHasItem(t, store);
    await testGetItem(t, store);
    await testListItems(t, store);
    await testRemoveItem(t, store);
    await testClearItems(t, store);
    await testCopyItems(t, store);
    await testMoveItems(t, store);
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

Deno.test("store - with prefix", async (t) => {
  try {
    Deno.env.delete("STORAGE_MODULE");

    store.setStore(import("@jollytoad/store-deno-kv"), "store");
    store.setStore(import("@jollytoad/store-no-op"));

    await open(t, store);

    await testUrl(t, store, "store-no-op");
    await testUrlForPrefix(t, store, "store-deno-kv", "store");

    await testIsWritable(t, store, false);
    await testIsWritable(t, store, true, "store");

    await testSetItem(t, store);
    await testHasItem(t, store);
    await testGetItem(t, store);
    await testListItems(t, store);
    await testRemoveItem(t, store);
    await testClearItems(t, store);
    await testCopyItems(t, store);
    await testMoveItems(t, store);
  } finally {
    await store.close();
  }
});
