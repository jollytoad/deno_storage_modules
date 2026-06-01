import type { StorageProvider } from "@storage/types";
import { canMoveItems, moveItems } from "@storage/fns/move-items";
import { canSetItem, setItem } from "@storage/fns/set-item";
import { clearItems } from "@storage/fns/clear-items";
import { createTestItems } from "./fixtures.ts";

const SRC = ["bench", "src"];
const DST = ["bench", "dst"];

/**
 * Benchmark {@linkcode moveItems} — write N items, move to a new prefix, clean up.
 */
export function benchMoveItems(
  store: StorageProvider,
  name = "",
  iterations = 100,
): void {
  Deno.bench({
    name: `${name} moveItems`,
    ignore: !canMoveItems(store) || !canSetItem(store),
    fn: async (b) => {
      const items = createTestItems(iterations, SRC);
      for (const [key, value] of items) {
        await setItem(store, [...key], value);
      }
      b.start();
      await moveItems(store, SRC, DST);
      b.end();
      await clearItems(store, ["bench"]);
    },
  });
}
