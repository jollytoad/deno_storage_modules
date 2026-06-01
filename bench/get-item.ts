import type { StorageKey, StorageProvider } from "@storage/types";
import { canGetItem, getItem } from "@storage/fns/get-item";
import { canSetItem, setItem } from "@storage/fns/set-item";
import { clearItems } from "@storage/fns/clear-items";

const PREFIX = ["bench"];

/**
 * Benchmark {@linkcode getItem} — write N items, read each, then clean up.
 */
export async function benchGetItem(
  store: StorageProvider,
  items: Map<StorageKey, unknown>,
): Promise<void> {
  const name = await store.url();
  Deno.bench({
    name: `${name} getItem`,
    ignore: !canGetItem(store) || !canSetItem(store),
    fn: async (b) => {
      for (const [key, value] of items) {
        await setItem(store, [...key], value);
      }

      b.start();

      for (const [key] of items) {
        await getItem(store, [...key]);
      }

      b.end();

      await clearItems(store, PREFIX);
    },
  });
}
