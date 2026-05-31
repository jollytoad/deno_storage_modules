import type { StorageKey, StorageProvider } from "@storage/types";
import { canListItems, listItems } from "./list.ts";
import { canClearItems, clearItems } from "./clear-items.ts";

/**
 * Default implementation of copyItems for stores that might
 * not implement it, or for copying between stores.
 * This will not preserve the expiry time of the item at the new key.
 */
export async function copyItems(
  fromStore: StorageProvider,
  fromPrefix: StorageKey,
  toPrefix: StorageKey,
  toStore: StorageProvider = fromStore,
): Promise<void> {
  if (fromStore === toStore && fromStore.copyItems) {
    return fromStore.copyItems(fromPrefix, toPrefix);
  }

  if (canClearItems(toStore) && fromStore.getItem && toStore.setItem) {
    await clearItems(toStore, toPrefix);

    const value = await fromStore.getItem(fromPrefix);
    if (value !== undefined) {
      await toStore.setItem(toPrefix, value);
    }

    for await (const [key, value] of listItems(fromStore, fromPrefix)) {
      const toKey = [...toPrefix, ...key.slice(fromPrefix.length)];
      await toStore.setItem(toKey, value);
    }
  }
}

/**
 * Can `copyItems` be used on the store?
 */
export function canCopyItems(
  fromStore: StorageProvider,
  toStore: StorageProvider = fromStore,
): boolean {
  return (fromStore === toStore && !!fromStore.copyItems) ||
    (!!toStore.clearItems && !!toStore.setItem && !!fromStore.getItem &&
      canListItems(fromStore));
}
