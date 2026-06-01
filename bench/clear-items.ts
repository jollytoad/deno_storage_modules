import type { StorageProvider } from "@storage/types";
import { canClearItems, clearItems } from "@storage/fns/clear-items";
import { canSetItem, setItem } from "@storage/fns/set-item";
import { createTestItems } from "./fixtures.ts";

const PREFIX = ["bench"];

/**
 * Benchmark {@linkcode clearItems} — write N items, clear the prefix.
 */
export function benchClearItems(
  store: StorageProvider,
  name = "",
  iterations = 100,
): void {
  Deno.bench({
    name: `${name} clearItems`,
    ignore: !canClearItems(store) || !canSetItem(store),
    fn: async (b) => {
      const items = createTestItems(iterations, PREFIX);
      for (const [key, value] of items) {
        await setItem(store, [...key], value);
      }
      b.start();
      await clearItems(store, PREFIX);
      b.end();
    },
  });
}
