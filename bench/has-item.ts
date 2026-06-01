import type { StorageKey, StorageProvider } from "@storage/types";
import { canHasItem, hasItem } from "@storage/fns/has-item";
import { canSetItem, setItem } from "@storage/fns/set-item";
import { clearItems } from "@storage/fns/clear-items";

const PREFIX = ["bench"];

/**
 * Benchmark {@linkcode hasItem} — write N items, check each, then clean up.
 */
export async function benchHasItem(
  store: StorageProvider,
  items: Map<StorageKey, unknown>,
): Promise<void> {
  const name = await store.url();
  Deno.bench({
    name: `${name} hasItem`,
    ignore: !canHasItem(store) || !canSetItem(store),
    fn: async (b) => {
      for (const [key, value] of items) {
        await setItem(store, [...key], value);
      }

      b.start();

      for (const [key] of items) {
        await hasItem(store, [...key]);
      }

      b.end();

      await clearItems(store, PREFIX);
    },
  });
}
