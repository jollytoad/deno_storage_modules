import { assertArrayIncludes, assertEquals } from "@std/assert";
import { assertSpyCalls, spy } from "@std/testing/mock";
import type { BatchOptions, StorageKey, StorageProvider } from "@storage/types";
import { TEST_ITEMS, TEST_PREFIX } from "./fixtures.ts";
import { canSetItem, setItem } from "@storage/fns/set-item";
import { canRemoveItem, removeItem } from "@storage/fns/remove-item";
import { batch } from "@storage/fns/batch";
import { canListItems, listItems } from "@storage/fns/list";
import { canGetItem, getItem } from "@storage/fns/get-item";

function createSpyStore(store: StorageProvider) {
  return {
    ...store,
    setItem: spy(store.setItem!),
    removeItem: spy(store.removeItem!),
    commit: store.commit ? spy(store.commit) : undefined,
  };
}

/**
 * Test the {@linkcode batch} function of the given storage module.
 */
export async function testBatch(
  t: Deno.TestContext,
  store: StorageProvider,
  batchOptions?: BatchOptions,
  items: Iterable<[StorageKey, unknown]> = TEST_ITEMS,
  prefix: StorageKey = TEST_PREFIX,
) {
  await t.step({
    ignore: !canSetItem(store) || !canRemoveItem(store),
    name: `batch (atomic: ${batchOptions?.atomic})`,
    fn: async (t) => {
      await t.step("setItem", async (t) => {
        const spyStore = createSpyStore(store);

        await batch(spyStore, async () => {
          for (const [key, value] of items) {
            await setItem(spyStore, [...key], value);
          }

          assertSpyCalls(spyStore.setItem, 0);
        }, batchOptions);

        if (store.commit) {
          await t.step("store.commit called", () => {
            assertSpyCalls(spyStore.commit!, 1);
          });
        } else {
          await t.step("store.setItem called by default commit", () => {
            assertSpyCalls(spyStore.setItem, Array.from(items).length);
          });
        }

        await t.step({
          ignore: !canListItems(store),
          name: "items were set as expected",
          fn: async () => {
            const list = Array.from(items);
            for await (const item of listItems(store, prefix)) {
              assertArrayIncludes(list, [item]);
            }
          },
        });
      });

      await t.step("removeItem", async (t) => {
        const spyStore = createSpyStore(store);

        await batch(spyStore, async () => {
          for (const [key] of items) {
            await removeItem(spyStore, [...key]);
          }

          assertSpyCalls(spyStore.removeItem, 0);
        }, batchOptions);

        if (store.commit) {
          await t.step("store.commit called", () => {
            assertSpyCalls(spyStore.commit!, 1);
          });
        } else {
          await t.step("store.removeItem called by default commit", () => {
            assertSpyCalls(spyStore.removeItem, Array.from(items).length);
          });
        }

        await t.step({
          ignore: !canListItems(store),
          name: "items were removed as expected",
          fn: async () => {
            const list = await Array.fromAsync(listItems(store, prefix));
            assertEquals(list.length, 0, "expected no items to be found");
          },
        });
      });

      await t.step("later ops override prior ops with same key", async (t) => {
        const spyStore = createSpyStore(store);

        const key = [...TEST_PREFIX, "batch", "dupe"];

        await t.step("setup", async () => {
          await setItem(store, [...key], "one");
        });

        await batch(spyStore, async () => {
          await removeItem(spyStore, [...key]);
          await setItem(spyStore, [...key], "two");
          await removeItem(spyStore, [...key]);
          await setItem(spyStore, [...key], "three");
        }, batchOptions);

        if (store.commit) {
          await t.step("store.commit called", () => {
            assertSpyCalls(spyStore.commit!, 1);
          });
        } else {
          await t.step("store.setItem called once by default commit", () => {
            assertSpyCalls(spyStore.setItem, 1);
          });
          await t.step(
            "store.removeItem never called by default commit",
            () => {
              assertSpyCalls(spyStore.removeItem, 0);
            },
          );
        }

        await t.step({
          ignore: !canGetItem(store),
          name: "item was set as expected",
          fn: async () => {
            const value = await getItem<string>(store, [...key]);
            assertEquals(value, "three");
          },
        });

        await t.step("clean up", async () => {
          await removeItem(store, [...key]);
        });
      });
    },
  });
}
