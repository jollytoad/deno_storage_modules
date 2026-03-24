import type { StorageKey, StorageProvider } from "@storage/types";

/**
 * Default implementation of isWritable for stores that might
 * not implement it.
 */
export function isWritable(
  store: StorageProvider,
  key?: StorageKey,
): Promise<boolean> {
  if (store.isWritable) {
    return store.isWritable(key);
  } else if (store.setItem || store.removeItem || store.clearItems) {
    return Promise.resolve(true);
  } else {
    return Promise.resolve(false);
  }
}
