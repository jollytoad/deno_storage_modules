import type { StorageProvider } from "@storage/types";
import { canRemoveItem, removeItem } from "@storage/fns/remove-item";
import { canSetItem, setItem } from "@storage/fns/set-item";
import { createTestItems } from "./fixtures.ts";

const PREFIX = ["bench"];

/**
 * Benchmark {@linkcode removeItem} — write N items, remove each.
 */
export function benchRemoveItem(
  store: StorageProvider,
  name = "",
  iterations = 100,
): void {
  Deno.bench({
    name: `${name} removeItem`,
    ignore: !canRemoveItem(store) || !canSetItem(store),
    fn: async (b) => {
      const items = createTestItems(iterations, PREFIX);
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
