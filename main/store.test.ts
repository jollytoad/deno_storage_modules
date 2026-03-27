// deno-lint-ignore-file require-await
import { assertRejects } from "@std/assert/rejects";
import {
  createTestItems,
  setup,
  teardown,
  testIsWritable,
  testStore,
  testUrlForPrefix,
} from "@storage/test";
import * as store from "./mod.ts";
import type {
  BatchedOperation,
  DelegatedStore,
  StorageKey,
} from "@storage/types";
import { assertArrayIncludes } from "@std/assert/array-includes";
import { assertSpyCalls, spy } from "@std/testing/mock";

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

Deno.test("store - batch across multiple providers", async (t) => {
  const map1 = new Map<StorageKey, unknown>();
  const map2 = new Map<StorageKey, unknown>();

  // Provider1 does NOT have its own `commit`, and so batched ops
  // will be delegated to it's setItem/removeItem functions
  const provider1 = mockProvider("provider1", map1, false);

  // Provider2 has it's own `commit` which will handle the ops itself
  const provider2 = mockProvider("provider2", map2, true);

  store.setStore(provider1, "one");
  store.setStore(provider2, "two");
  store.setStore(import("@storage/no-op"));

  const testItems1 = createTestItems(["one"]);
  const testItems2 = createTestItems(["two"]);

  const testItems = [...testItems1, ...testItems2];

  try {
    await setup(t, store);

    await testUrlForPrefix(t, store, "provider1", "one");
    await testUrlForPrefix(t, store, "provider2", "two");

    await t.step("batch set items", async () => {
      await store.batch(async () => {
        for (const [key, value] of testItems) {
          await store.setItem(key, value);
        }
      });
    });

    await t.step("check items have been added to stores", () => {
      assertArrayIncludes([...map1], [...testItems1]);
      assertArrayIncludes([...map2], [...testItems2]);
    });

    await t.step("check setItem was called on provider1 for each item", () => {
      assertSpyCalls(provider1.setItem, testItems1.size);
    });

    await t.step("check setItem was NOT called on provider2", () => {
      assertSpyCalls(provider2.setItem, 0);
    });

    await t.step("check commit was called on provider2", () => {
      assertSpyCalls(provider2.commit!, 1);
    });
  } finally {
    await teardown(t, store);
  }
});

/**
 * Create a minimal StorageProvider for testing batched ops
 *
 * @param url an identifier for the provider
 * @param map a `Map` in which items will be saved
 * @param selfCommit whether a `commit` fn will be included in the provider
 */
function mockProvider(
  url: string,
  map: Map<StorageKey, unknown>,
  selfCommit: boolean,
) {
  return {
    url: async () => url,

    setItem: spy(async <T>(key: StorageKey, value: T) => {
      map.set(key, value);
      return;
    }),

    getItem: async <T>(key: StorageKey) => map.get(key) as T | undefined,

    removeItem: spy(async (key: StorageKey) => {
      map.delete(key);
      return;
    }),

    close: async () => {
      map.clear();
      return;
    },

    ...(selfCommit
      ? {
        commit: spy(
          async function* (
            ops: Iterable<BatchedOperation>,
          ): AsyncIterable<void> {
            for (const [opName, key, value] of ops) {
              switch (opName) {
                case "setItem":
                  map.set(key, value);
                  break;
                case "removeItem":
                  map.delete(key);
              }
              yield;
            }
          },
        ),
      }
      : undefined),
  };
}
