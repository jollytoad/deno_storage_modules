import { assertRejects } from "@std/assert/rejects";
import { testIsWritable, testStore, testUrlForPrefix } from "@storage/test";
import * as store from "./mod.ts";
import type { DelegatedStore } from "@storage/types";

Deno.test("store - via STORAGE_MODULE", async (t) => {
  Deno.env.set(
    "STORAGE_MODULE",
    import.meta.resolve("@storage/web-storage"),
  );

  // clear the store implementation, so it gets picked up by the env var
  store.setStore();

  await testStore(t, store, { urlIncludes: "web-storage" });
});

Deno.test("store - via setStore()", async (t) => {
  Deno.env.delete("STORAGE_MODULE");

  store.setStore(import("@storage/deno-kv"));

  await testStore(t, store, { urlIncludes: "deno-kv" });
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
  Deno.env.delete("STORAGE_MODULE");

  store.setStore(import("@storage/deno-kv"), "store");
  store.setStore(import("@storage/no-op"));

  await testStore(t, store, {
    urlIncludes: "no-op",
    readonly: true,
    extraTests: [
      (t, store) =>
        testUrlForPrefix(t, store as DelegatedStore, "deno-kv", "store"),
      (t, store) => testIsWritable(t, store, true, "store"),
    ],
  });
});
