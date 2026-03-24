import { canListKeys, listKeys } from "./list.ts";
import type { StorageKey, StorageProvider } from "@storage/types";
import { canRemoveItem } from "./remove-item.ts";

/**
 * Default implementation of clearItems for stores that do not implement it.
 * Delete item and sub items recursively and clean up.
 */
export async function clearItems(
  store: StorageProvider,
  prefix: StorageKey,
): Promise<void> {
  if (store.clearItems) {
    return store.clearItems(prefix);
  } else if (store.removeItem) {
    if (prefix.length) {
      await store.removeItem(prefix);
    }

    for await (const key of listKeys(store, prefix)) {
      await store.removeItem(key);
    }
  }
}

/**
 * Can `clearItems` by used on the store?
 */
export function canClearItems(store: StorageProvider): boolean {
  return !!store.clearItems || (canRemoveItem(store) && canListKeys(store));
}
