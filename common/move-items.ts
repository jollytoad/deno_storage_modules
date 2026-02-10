import type { StorageKey, StorageModule } from "./types.ts";
import { copyItems } from "./copy-items.ts";

/**
 * Default implementation for moveItems
 * This will not preserve the expiry time of the item at the new key.
 */
export async function moveItems<T>(
  fromPrefix: StorageKey,
  toPrefix: StorageKey,
  fromStore: StorageModule<T>,
  toStore: StorageModule<T> = fromStore,
): Promise<void> {
  await copyItems(fromPrefix, toPrefix, fromStore, toStore);
  await fromStore.clearItems(fromPrefix);
}
