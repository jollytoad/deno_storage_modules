import type { StorageKey, StorageProvider } from "@storage/types";

/**
 * Default implementation of hasItem for stores that might
 * not implement it.
 */
export async function hasItem(
  store: StorageProvider,
  key: StorageKey,
): Promise<boolean> {
  if (store.hasItem) {
    return store.hasItem(key);
  } else if (store.getItem) {
    return (await store.getItem(key)) !== undefined;
  } else {
    return false;
  }
}

/**
 * Can `hasItem` be used on the store?
 */
export function canHasItem(store: StorageProvider): boolean {
  return !!store.hasItem || !!store.getItem;
}
