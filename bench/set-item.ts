import type { StorageKey, StorageProvider } from "@storage/types";
import { canSetItem, setItem } from "@storage/fns/set-item";
import { clearItems } from "@storage/fns/clear-items";

const PREFIX = ["bench"];

/**
 * Benchmark {@linkcode setItem} — write N items then clean up.
 */
export function benchSetItem(
  store: StorageProvider,
  items: Map<StorageKey, unknown>,
): void {
  Deno.bench({
    name: `setItem`,
    ignore: !canSetItem(store),
    fn: async (b) => {
      b.start();

      for (const [key, value] of items) {
        await setItem(store, [...key], value);
      }

      b.end();

      await clearItems(store, PREFIX);
    },
  });
}
