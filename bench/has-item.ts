import type { StorageProvider } from "@storage/types";
import { canHasItem, hasItem } from "@storage/fns/has-item";
import { canSetItem, setItem } from "@storage/fns/set-item";
import { clearItems } from "@storage/fns/clear-items";
import { createTestItems } from "./fixtures.ts";

const PREFIX = ["bench"];

/**
 * Benchmark {@linkcode hasItem} — write N items, check each, then clean up.
 */
export function benchHasItem(
  store: StorageProvider,
  name = "",
  iterations = 100,
): void {
  Deno.bench({
    name: `${name} hasItem`,
    ignore: !canHasItem(store) || !canSetItem(store),
    fn: async (b) => {
      const items = createTestItems(iterations, PREFIX);
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
