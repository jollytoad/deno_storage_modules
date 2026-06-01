import type { StorageKey, StorageProvider } from "@storage/types";
import { canSetItem, setItem } from "@storage/fns/set-item";
import { clearItems } from "@storage/fns/clear-items";
import {
  canListItems,
  canListKeys,
  canListValues,
  listItems,
  listKeys,
  listValues,
} from "@storage/fns/list";

const PREFIX = ["bench"];

/**
 * Benchmark {@linkcode listItems}, {@linkcode listKeys} and
 * {@linkcode listValues} — write N items, iterate, clean up.
 */
export async function benchList(
  store: StorageProvider,
  items: Map<StorageKey, unknown>,
): Promise<void> {
  const name = await store.url();
  Deno.bench({
    name: `${name} listItems`,
    ignore: !canListItems(store) || !canSetItem(store),
    fn: async (b) => {
      for (const [key, value] of items) {
        await setItem(store, [...key], value);
      }

      b.start();

      for await (const _ of listItems(store, PREFIX)) {
        // drain
      }

      b.end();

      await clearItems(store, PREFIX);
    },
  });

  Deno.bench({
    name: `${name} listKeys`,
    ignore: !canListKeys(store) || !canSetItem(store),
    fn: async (b) => {
      for (const [key, value] of items) {
        await setItem(store, [...key], value);
      }

      b.start();

      for await (const _ of listKeys(store, PREFIX)) {
        // drain
      }

      b.end();

      await clearItems(store, PREFIX);
    },
  });

  Deno.bench({
    name: `${name} listValues`,
    ignore: !canListValues(store) || !canSetItem(store),
    fn: async (b) => {
      for (const [key, value] of items) {
        await setItem(store, [...key], value);
      }

      b.start();

      for await (const _ of listValues(store, PREFIX)) {
        // drain
      }

      b.end();

      await clearItems(store, PREFIX);
    },
  });
}
