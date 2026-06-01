import type { StorageProvider } from "@storage/types";
import { canCopyItems, copyItems } from "@storage/fns/copy-items";
import { canSetItem, setItem } from "@storage/fns/set-item";
import { clearItems } from "@storage/fns/clear-items";
import { createTestItems } from "./fixtures.ts";

const SRC = ["bench", "src"];
const DST = ["bench", "dst"];

/**
 * Benchmark {@linkcode copyItems} — write N items, copy to a new prefix, clean up.
 */
export function benchCopyItems(
  store: StorageProvider,
  name = "",
  iterations = 100,
): void {
  Deno.bench({
    name: `${name} copyItems`,
    ignore: !canCopyItems(store) || !canSetItem(store),
    fn: async (b) => {
      const items = createTestItems(iterations, SRC);
      for (const [key, value] of items) {
        await setItem(store, [...key], value);
      }
      b.start();
      await copyItems(store, SRC, DST);
      b.end();
      await clearItems(store, ["bench"]);
    },
  });
}
