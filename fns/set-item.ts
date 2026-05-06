import type {
  SetItemOptions,
  StorageKey,
  StorageProvider,
} from "@storage/types";
import { addOp, inBatch } from "./batch.ts";

/**
 * Default implementation of setItem for stores that might
 * not implement it.
 */
export function setItem<T>(
  store: StorageProvider,
  key: StorageKey,
  value: T,
  options?: SetItemOptions,
): Promise<void> {
  if (store.setItem) {
    if (inBatch()) {
      addOp(["setItem", key, value, options]);
    } else {
      return store.setItem(key, value, options);
    }
  }
  return Promise.resolve();
}

/**
 * Can `setItem` be used on the store?
 */
export function canSetItem(store: StorageProvider): boolean {
  return !!store.setItem;
}
