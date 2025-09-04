import type { StorageKey, StorageModule } from "@jollytoad/store-common/types";
import { copyItems } from "./copy-items.ts";

/**
 * Default implementation for moveItems
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
