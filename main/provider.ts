import type {
  Awaitable,
  BatchedOperation,
  BatchOptions,
  DelegatedStoreConfig,
  GetItemsOptions,
  ListItemsOptions,
  SetItemOptions,
  StorageKey,
  StorageProvider,
} from "@storage/types";
import * as fn from "@storage/fns";
import { getDelegated, url } from "./delegate.ts";
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
  const { store, mapKey } = getDelegated(key);
  return fn.isWritable(await store, mapKey(key));
}

/**
 * Determine whether a value is set for the given key in the delegated storage.
 */
export async function hasItem(key: StorageKey): Promise<boolean> {
  const { store, mapKey } = getDelegated(key);
  return fn.hasItem(await store, mapKey(key));
}

/**
 * Get a value for the given key from the delegated storage.
 */
export async function getItem<T>(key: StorageKey): Promise<T | undefined> {
  const { store, mapKey } = getDelegated(key);
  return fn.getItem(await store, mapKey(key));
}

/**
 * Set a value for the given key in the delegated storage.
 */
export async function setItem<T>(
  key: StorageKey,
  value: T,
  options?: SetItemOptions,
): Promise<void> {
  const { store, mapKey, setItemOptions } = getDelegated(key);
  return fn.setItem(await store, mapKey(key), value, {
    ...setItemOptions,
    ...options,
  });
}

/**
 * Remove the value with the given key from the delegated storage.
 */
export async function removeItem(key: StorageKey): Promise<void> {
  const { store, mapKey } = getDelegated(key);
  return fn.removeItem(await store, mapKey(key));
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
  const { store, mapKey, listItemsOptions } = getDelegated(prefix);
  yield* fn.listItems(await store, mapKey(prefix), {
    ...listItemsOptions,
    ...options,
  });
}

/**
 * List all values beneath the given key prefix in the delegated storage.
 */
export async function* listValues<T>(
  prefix: StorageKey = [],
  options?: ListItemsOptions,
): AsyncIterable<T> {
  const { store, mapKey, listItemsOptions } = getDelegated(prefix);
  yield* fn.listValues<T>(await store, mapKey(prefix), {
    ...listItemsOptions,
    ...options,
  });
}

/**
 * List all keys beneath the given key prefix in the delegated storage.
 */
export async function* listKeys(
  prefix: StorageKey = [],
  options?: ListItemsOptions,
): AsyncIterable<StorageKey> {
  const { store, mapKey, listItemsOptions } = getDelegated(prefix);
  yield* fn.listKeys(await store, mapKey(prefix), {
    ...listItemsOptions,
    ...options,
  });
}

/**
 * Delete item and sub items recursively from the delegated storage and
 * clean up.
 */
export async function clearItems(prefix: StorageKey): Promise<void> {
  const { store, mapKey } = getDelegated(prefix);
  return fn.clearItems(await store, mapKey(prefix));
}

/**
 * Copy an item and all sub items to a new key.
 * This will not preserve the expiry time of the item at the new key.
 */
export async function copyItems(
  fromPrefix: StorageKey,
  toPrefix: StorageKey,
): Promise<void> {
  const fromEntry = getDelegated(fromPrefix);
  const toEntry = getDelegated(toPrefix);
  const [fromStore, toStore] = await Promise.all([
    fromEntry.store,
    toEntry.store,
  ]);
  return fn.copyItems(
    fromStore,
    fromEntry.mapKey(fromPrefix),
    toEntry.mapKey(toPrefix),
    toStore,
  );
}

/**
 * Move an item and all sub items to a new key.
 * This will not preserve the expiry time of the item at the new key.
 */
export async function moveItems(
  fromPrefix: StorageKey,
  toPrefix: StorageKey,
): Promise<void> {
  const fromEntry = getDelegated(fromPrefix);
  const toEntry = getDelegated(toPrefix);
  const [fromStore, toStore] = await Promise.all([
    fromEntry.store,
    toEntry.store,
  ]);
  return await fn.moveItems(
    fromStore,
    fromEntry.mapKey(fromPrefix),
    toEntry.mapKey(toPrefix),
    toStore,
  );
}

/**
 * Get many items at once from the delegate stores.
 */
export async function* getItems<T>(
  keys: Iterable<StorageKey>,
  options?: GetItemsOptions,
): AsyncIterable<[StorageKey, T]> {
  // TODO: use MuxAsyncIterator
  for await (
    const [store, groupedKeys, storeDefaults] of groupKeysByStore(keys)
  ) {
    yield* fn.getItems<T>(store, groupedKeys, {
      ...storeDefaults,
      ...options,
    });
  }
}

async function* groupKeysByStore(
  keys: Iterable<StorageKey>,
): AsyncIterable<[StorageProvider, Iterable<StorageKey>, GetItemsOptions?]> {
  const keysPerEntry = new Map<
    DelegatedStoreConfig,
    { storePromise: Awaitable<StorageProvider>; keys: Set<StorageKey> }
  >();

  for (const key of Iterator.from(keys)) {
    const entry = getDelegated(key);
    let group = keysPerEntry.get(entry);
    if (!group) {
      group = { storePromise: entry.store, keys: new Set() };
      keysPerEntry.set(entry, group);
    }
    group!.keys.add(entry.mapKey(key));
  }

  for (const [entry, { storePromise, keys }] of keysPerEntry) {
    yield [await storePromise, keys.values(), entry.getItemsOptions];
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
  // Group ops by delegated storage entry
  const groupedOps = new Map<
    DelegatedStoreConfig,
    {
      storePromise: Awaitable<StorageProvider>;
      ops: BatchedOperation[];
      batchOptions: BatchOptions | undefined;
    }
  >();
  for (const op of ops) {
    const entry = getDelegated(op[1]);
    const mappedKey = entry.mapKey(op[1]);
    const mappedOp = [
      op[0],
      mappedKey,
      ...op.slice(2),
    ] as unknown as BatchedOperation;
    let group = groupedOps.get(entry);
    if (!group) {
      group = {
        storePromise: entry.store,
        ops: [],
        batchOptions: entry.batchOptions,
      };
      groupedOps.set(entry, group);
    }
    group!.ops.push(mappedOp);
  }

  // Perform commits for individual storage providers
  for (const { storePromise, ops, batchOptions } of groupedOps.values()) {
    const store = await storePromise;
    const merged = { ...batchOptions, ...options };
    yield* store.commit
      ? store.commit(ops, merged)
      : defaultCommit(store, ops, merged);
  }
}
