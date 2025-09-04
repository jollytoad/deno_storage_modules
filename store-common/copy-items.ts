import type {
  MinimalStorageModule,
  StorageKey,
  StorageModule,
} from "@jollytoad/store-common/types";

/**
 * Default implementation of copyItems for stores that might
 * not implement it, or for copying between stores.
 */
export async function copyItems<T>(
  fromPrefix: StorageKey,
  toPrefix: StorageKey,
  fromStore: StorageModule<T>,
  toStore: MinimalStorageModule<T> = fromStore,
): Promise<void> {
  if (fromStore === toStore && fromStore.copyItems) {
    return fromStore.copyItems(fromPrefix, toPrefix);
  }

  await toStore.clearItems(toPrefix);

  const value = await fromStore.getItem(fromPrefix);
  if (value !== undefined) {
    await toStore.setItem(toPrefix, value);
  }

  for await (const [key, value] of fromStore.listItems(fromPrefix)) {
    const toKey = [...toPrefix, ...key.slice(fromPrefix.length)];
    await toStore.setItem(toKey, value);
  }
}
