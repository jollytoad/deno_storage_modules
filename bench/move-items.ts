import type { StorageKey, StorageProvider } from "@storage/types";
import { canMoveItems, moveItems } from "@storage/fns/move-items";
import { canSetItem, setItem } from "@storage/fns/set-item";
import { clearItems } from "@storage/fns/clear-items";

const SRC = ["bench"];
const DST = ["bench-dst"];

/**
 * Benchmark {@linkcode moveItems} — write N items, move to a new prefix, clean up.
 */
export function benchMoveItems(
  store: StorageProvider,
  items: Map<StorageKey, unknown>,
): void {
  Deno.bench({
    name: `moveItems`,
    ignore: !canMoveItems(store) || !canSetItem(store),
    fn: async (b) => {
      for (const [key, value] of items) {
        await setItem(store, [...key], value);
      }

      b.start();

      await moveItems(store, SRC, DST);

      b.end();

      await clearItems(store, ["bench"]);
      await clearItems(store, ["bench-dst"]);
    },
  });
}
