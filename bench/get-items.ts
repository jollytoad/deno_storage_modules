import type { StorageKey, StorageProvider } from "@storage/types";
import { canGetItems, getItems } from "@storage/fns/get-items";
import { canSetItem, setItem } from "@storage/fns/set-item";
import { clearItems } from "@storage/fns/clear-items";

const PREFIX = ["bench"];

/**
 * Benchmark {@linkcode getItems} — write N items, get by keys, then clean up.
 */
export async function benchGetItems(
  store: StorageProvider,
  items: Map<StorageKey, unknown>,
): Promise<void> {
  const name = await store.url();
  Deno.bench({
    name: `${name} getItems`,
    ignore: !canGetItems(store) || !canSetItem(store),
    fn: async (b) => {
      const keys: StorageKey[] = [];

      for (const [key] of items) {
        keys.push([...key]);
        await setItem(store, [...key], items.get(key)!);
      }

      b.start();

      for await (const _ of getItems(store, keys)) {
        // drain
      }

      b.end();

      await clearItems(store, PREFIX);
    },
  });
}
