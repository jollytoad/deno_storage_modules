import type { StorageKey, StorageProvider } from "@storage/types";
import { addOp, inBatch } from "./batch.ts";

/**
 * Default implementation of removeItem for stores that might
 * not implement it.
 */
export function removeItem(
  store: StorageProvider,
  key: StorageKey,
): Promise<void> {
  if (store.removeItem) {
    if (inBatch()) {
      addOp(["removeItem", key]);
    } else {
      return store.removeItem(key);
    }
  }
  return Promise.resolve();
}

/**
 * Can `removeItem` be used on the store?
 */
export function canRemoveItem(store: StorageProvider): boolean {
  return !!store.removeItem;
}
