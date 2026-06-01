import type { StorageKey, StorageProvider } from "@storage/types";
import { canGetItems, getItems } from "@storage/fns/get-items";
import { canSetItem, setItem } from "@storage/fns/set-item";
import { clearItems } from "@storage/fns/clear-items";
import { createTestItems } from "./fixtures.ts";

const PREFIX = ["bench"];

/**
 * Benchmark {@linkcode getItems} — write N items, get by keys, then clean up.
 */
export function benchGetItems(
  store: StorageProvider,
  name = "",
  iterations = 100,
): void {
  Deno.bench({
    name: `${name} getItems`,
    ignore: !canGetItems(store) || !canSetItem(store),
    fn: async (b) => {
      const items = createTestItems(iterations, PREFIX);
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
