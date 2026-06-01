import type { StorageKey, StorageProvider } from "@storage/types";
import { canRemoveItem, removeItem } from "@storage/fns/remove-item";
import { canSetItem, setItem } from "@storage/fns/set-item";

/**
 * Benchmark {@linkcode removeItem} — write N items, remove each.
 */
export function benchRemoveItem(
  store: StorageProvider,
  items: Map<StorageKey, unknown>,
): void {
  Deno.bench({
    name: `removeItem`,
    ignore: !canRemoveItem(store) || !canSetItem(store),
    fn: async (b) => {
      for (const [key, value] of items) {
        await setItem(store, [...key], value);
      }

      b.start();

      for (const [key] of items) {
        await removeItem(store, [...key]);
      }

      b.end();
    },
  });
}
