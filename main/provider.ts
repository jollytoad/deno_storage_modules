import type {
  BatchedOperation,
  BatchOptions,
  GetItemsOptions,
  ListItemsOptions,
  SetItemOptions,
  StorageKey,
  StorageProvider,
} from "@storage/types";
import * as fn from "@storage/fns";
import { getStore, url } from "./delegate.ts";
import { defaultCommit } from "@storage/util/default-commit";

({
  isWritable,
  url,
  hasItem,
  getItem,
  setItem,
  removeItem,
  listItems,
  listValues,
  listKeys,
  clearItems,
  copyItems,
  moveItems,
  getItems,
}) satisfies StorageProvider;

export { url };

/**
 * Check whether the delegated storage is writable in general, or at or below a
 * particular key. There still may be some sub-keys that differ.
 */
export async function isWritable(key: StorageKey = []): Promise<boolean> {
  return fn.isWritable(await getStore(key), key);
}

/**
 * Determine whether a value is set for the given key in the delegated storage.
 */
export async function hasItem(key: StorageKey): Promise<boolean> {
  return fn.hasItem(await getStore(key), key);
}

/**
 * Get a value for the given key from the delegated storage.
 */
export async function getItem<T>(key: StorageKey): Promise<T | undefined> {
  return fn.getItem(await getStore(key), key);
}

/**
 * Set a value for the given key in the delegated storage.
 */
export async function setItem<T>(
  key: StorageKey,
  value: T,
  options?: SetItemOptions,
): Promise<void> {
  return fn.setItem(await getStore(key), key, value, options);
}

/**
 * Remove the value with the given key from the delegated storage.
 */
export async function removeItem(key: StorageKey): Promise<void> {
  return fn.removeItem(await getStore(key), key);
}

/**
 * List all items (key -> value pairs) beneath the given key prefix in the
 * delegated storage.
 * At present, guaranteed ordering and reverse support is optional, and
 * dependent on the abilities of the delegated storage.
 */
export async function* listItems<T>(
  prefix: StorageKey = [],
  options?: ListItemsOptions,
): AsyncIterable<[StorageKey, T]> {
  yield* fn.listItems(await getStore(prefix), prefix, options);
}

/**
 * List all values beneath the given key prefix in the delegated storage.
 */
export async function* listValues<T>(
  prefix: StorageKey = [],
  options?: ListItemsOptions,
): AsyncIterable<T> {
  yield* fn.listValues<T>(await getStore(prefix), prefix, options);
}

/**
 * List all keys beneath the given key prefix in the delegated storage.
 */
export async function* listKeys(
  prefix: StorageKey = [],
  options?: ListItemsOptions,
): AsyncIterable<StorageKey> {
  yield* fn.listKeys(await getStore(prefix), prefix, options);
}

/**
 * Delete item and sub items recursively from the delegated storage and
 * clean up.
 */
export async function clearItems(prefix: StorageKey): Promise<void> {
  return fn.clearItems(await getStore(prefix), prefix);
}

/**
 * Copy an item and all sub items to a new key.
 * This will not preserve the expiry time of the item at the new key.
 */
export async function copyItems(
  fromPrefix: StorageKey,
  toPrefix: StorageKey,
): Promise<void> {
  const [fromStore, toStore] = await Promise.all([
    getStore(fromPrefix),
    getStore(toPrefix),
  ]);
  return fn.copyItems(fromStore, fromPrefix, toPrefix, toStore);
}

/**
 * Move an item and all sub items to a new key.
 * This will not preserve the expiry time of the item at the new key.
 */
export async function moveItems(
  fromPrefix: StorageKey,
  toPrefix: StorageKey,
): Promise<void> {
  const [fromStore, toStore] = await Promise.all([
    getStore(fromPrefix),
    getStore(toPrefix),
  ]);
  return await fn.moveItems(fromStore, fromPrefix, toPrefix, toStore);
}

/**
 * Get many items at once from the delegate stores.
 */
export async function* getItems<T>(
  keys: Iterable<StorageKey>,
  options?: GetItemsOptions,
): AsyncIterable<[StorageKey, T]> {
  // TODO: use MuxAsyncIterator
  for await (const [store, groupedKeys] of groupKeysByStore(keys)) {
    yield* fn.getItems<T>(store, groupedKeys, options);
  }
}

async function* groupKeysByStore(
  keys: Iterable<StorageKey>,
): AsyncIterable<[StorageProvider, Iterable<StorageKey>]> {
  const keysPerStore = new Map<StorageProvider, Set<StorageKey>>();

  await Promise.all(
    Iterator.from(keys).map(async (key) => {
      const store = await getStore(key);
      let group = keysPerStore.get(store);
      if (!group) {
        group = new Set();
        keysPerStore.set(store, group);
      }
      group.add(key);
    }),
  );

  for (const [store, keySet] of keysPerStore) {
    yield [store, keySet.values()];
  }
}

/**
 * Commit the current batch via the `commit` fns of the
 * individual delegate storage providers.
 */
export async function* commit(
  ops: Iterable<BatchedOperation>,
  options?: BatchOptions,
): AsyncIterable<void> {
  // Group ops by delegated storage provider
  const groupedOps = new Map<StorageProvider, BatchedOperation[]>();
  for (const op of ops) {
    const provider = await getStore(op[1]);
    let providerOps = groupedOps.get(provider);
    if (!providerOps) {
      providerOps = [];
      groupedOps.set(provider, providerOps);
    }
    providerOps.push(op);
  }

  // Perform commits for individual storage providers
  for (const [provider, ops] of groupedOps) {
    yield* provider.commit
      ? provider.commit(ops, options)
      : defaultCommit(provider, ops, options);
  }
}
