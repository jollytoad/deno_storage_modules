import type {
  GetItemsOptions,
  StorageKey,
  StorageProvider,
} from "@storage/types";
import { pooledMap } from "@std/async/pool";

const DEFAULT_CONCURRENCY = 10;

/**
 * Default implementation of getItems for stores that might
 * not implement it.
 */
export async function* getItems<T>(
  store: StorageProvider,
  keys: Iterable<StorageKey> | AsyncIterable<StorageKey>,
  options?: GetItemsOptions,
): AsyncIterable<[StorageKey, T]> {
  if (store.getItems) {
    yield* store.getItems(await Array.fromAsync(keys));
  } else if (store.getItem) {
    const concurrency = options?.concurrency ?? DEFAULT_CONCURRENCY;
    for await (const pair of pooledMap(concurrency, keys, getItem)) {
      if (pair[1] !== undefined) {
        yield pair as [StorageKey, T];
      }
    }
  }

  async function getItem<K extends StorageKey>(
    key: K,
  ): Promise<[K, T | undefined]> {
    return [key, await store.getItem?.(key)];
  }
}

/**
 * Can `getItems` by used on the store?
 */
export function canGetItems(store: StorageProvider): boolean {
  return !!store.getItems || !!store.getItem;
}
