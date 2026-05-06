import type { StorageKey, StorageProvider } from "@storage/types";

/**
 * Default implementation of getItem for stores that might
 * not implement it.
 */
export function getItem<T>(
  store: StorageProvider,
  key: StorageKey,
): Promise<T | undefined> {
  if (store.getItem) {
    return store.getItem(key);
  } else {
    return Promise.resolve(undefined);
  }
}

/**
 * Can `getItem` be used on the store?
 */
export function canGetItem(store: StorageProvider): boolean {
  return !!store.getItem;
}
