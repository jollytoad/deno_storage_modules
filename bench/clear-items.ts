import type { StorageKey, StorageProvider } from "@storage/types";
import { canClearItems, clearItems } from "@storage/fns/clear-items";
import { canSetItem, setItem } from "@storage/fns/set-item";

const PREFIX = ["bench"];

/**
 * Benchmark {@linkcode clearItems} — write N items, clear the prefix.
 */
export function benchClearItems(
  store: StorageProvider,
  items: Map<StorageKey, unknown>,
): void {
  Deno.bench({
    name: `clearItems`,
    ignore: !canClearItems(store) || !canSetItem(store),
    fn: async (b) => {
      for (const [key, value] of items) {
        await setItem(store, [...key], value);
      }

      b.start();

      await clearItems(store, PREFIX);

      b.end();
    },
  });
}
