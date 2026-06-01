import type { StorageKey, StorageProvider } from "@storage/types";
import { canCopyItems, copyItems } from "@storage/fns/copy-items";
import { canSetItem, setItem } from "@storage/fns/set-item";
import { clearItems } from "@storage/fns/clear-items";

const SRC = ["bench"];
const DST = ["bench-dst"];

/**
 * Benchmark {@linkcode copyItems} — write N items, copy to a new prefix, clean up.
 */
export async function benchCopyItems(
  store: StorageProvider,
  items: Map<StorageKey, unknown>,
): Promise<void> {
  const name = await store.url();
  Deno.bench({
    name: `${name} copyItems`,
    ignore: !canCopyItems(store) || !canSetItem(store),
    fn: async (b) => {
      for (const [key, value] of items) {
        await setItem(store, [...key], value);
      }

      b.start();

      await copyItems(store, SRC, DST);

      b.end();

      await clearItems(store, ["bench"]);
      await clearItems(store, ["bench-dst"]);
    },
  });
}
