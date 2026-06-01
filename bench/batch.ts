import type { StorageKey, StorageProvider } from "@storage/types";
import { batch } from "@storage/fns/batch";
import { canSetItem, setItem } from "@storage/fns/set-item";
import { canRemoveItem, removeItem } from "@storage/fns/remove-item";
import { clearItems } from "@storage/fns/clear-items";

const PREFIX = ["bench"];

/**
 * Benchmark {@linkcode batch} — batch-set and batch-remove N items.
 */
export async function benchBatch(
  store: StorageProvider,
  items: Map<StorageKey, unknown>,
): Promise<void> {
  const name = await store.url();
  Deno.bench({
    name: `${name} batch setItem`,
    ignore: !canSetItem(store) || !canRemoveItem(store),
    fn: async (b) => {
      b.start();

      await batch(store, async () => {
        for (const [key, value] of items) {
          await setItem(store, [...key], value);
        }
      });

      b.end();

      await clearItems(store, PREFIX);
    },
  });

  Deno.bench({
    name: `${name} batch removeItem`,
    ignore: !canSetItem(store) || !canRemoveItem(store),
    fn: async (b) => {
      for (const [key, value] of items) {
        await setItem(store, [...key], value);
      }

      b.start();

      await batch(store, async () => {
        for (const [key] of items) {
          await removeItem(store, [...key]);
        }
      });

      b.end();
    },
  });
}
