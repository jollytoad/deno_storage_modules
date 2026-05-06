import type { StorageKey, StorageProvider } from "@storage/types";
import { canCopyItems, copyItems } from "./copy-items.ts";
import { canClearItems, clearItems } from "./clear-items.ts";

/**
 * Default implementation for moveItems
 * This will not preserve the expiry time of the item at the new key.
 */
export async function moveItems<T>(
  fromStore: StorageProvider,
  fromPrefix: StorageKey,
  toPrefix: StorageKey,
  toStore: StorageProvider = fromStore,
): Promise<void> {
  if (fromStore === toStore && fromStore.moveItems) {
    return fromStore.moveItems(fromPrefix, toPrefix);
  }
  await copyItems(fromStore, fromPrefix, toPrefix, toStore);
  await clearItems(fromStore, fromPrefix);
}

/**
 * Can `moveItems` be used on the store?
 */
export function canMoveItems(
  fromStore: StorageProvider,
  toStore: StorageProvider = fromStore,
): boolean {
  return (fromStore === toStore && !!fromStore.moveItems) ||
    (canCopyItems(fromStore, toStore) && canClearItems(fromStore));
}
