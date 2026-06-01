import type { StorageProvider } from "@storage/types";
import { canSetItem, setItem } from "@storage/fns/set-item";
import { clearItems } from "@storage/fns/clear-items";
import { createTestItems } from "./fixtures.ts";

const PREFIX = ["bench"];

/**
 * Benchmark {@linkcode setItem} — write N items then clean up.
 */
export function benchSetItem(
  store: StorageProvider,
  name = "",
  iterations = 100,
): void {
  Deno.bench({
    name: `${name} setItem`,
    ignore: !canSetItem(store),
    fn: async (b) => {
      const items = createTestItems(iterations, PREFIX);
      b.start();
      for (const [key, value] of items) {
        await setItem(store, [...key], value);
      }
      b.end();
      await clearItems(store, PREFIX);
    },
  });
}
