import type {
  DelegatedStore,
  StorageKey,
  StorageModule,
} from "@jollytoad/store-common/types";

export type { DelegatedStore, StorageKey, StorageModule };

({
  isWritable,
  hasItem,
  getItem,
  setItem,
  removeItem,
  listItems,
  clearItems,
  close,
  url,
  setStore,
  getStore,
}) satisfies StorageModule & DelegatedStore;

let defaultStore: Promise<StorageModule> | undefined;
let stores: Map<string, Promise<StorageModule>> | undefined;

/**
 * Set the storage module to which all function calls are delegated
 *
 * @param storageModule may be the store, promise of the store, or undefined to remove any delegate store
 * @param prefix the given storage module will only apply to keys with this prefix, if this is not supplied
 *   then the given storage module is set as the default/fallback store
 */
export function setStore(
  storageModule?: StorageModule | Promise<StorageModule>,
  prefix?: string,
) {
  if (prefix === undefined) {
    defaultStore = storageModule ? Promise.resolve(storageModule) : undefined;
  } else if (storageModule) {
    stores ??= new Map();
    stores.set(prefix, Promise.resolve(storageModule));
  } else {
    stores?.delete(prefix);
  }
}

/**
 * Get the delegate storage module previously set via `setStore`,
 * if one has not been set it will attempt to dynamically import the module declared in
 * the `STORAGE_MODULE` environment variable.
 *
 * @returns the promise of the store to which all operations are delegated
 * @throws if no store or env var has been set, or if dynamic import fails
 */
export async function getStore(
  key?: StorageKey | string,
): Promise<StorageModule> {
  if (key && key.length) {
    const prefix = typeof key === "string" ? key : String(key[0]);
    if (prefix) {
      const store = stores?.get(prefix);
      if (store) {
        return store;
      }
    }
  }
  if (!defaultStore) {
    defaultStore = (await import("./_from_env.ts")).fromEnv();
  }
  return await defaultStore;
}

/**
 * Returns the `url()` of the delegated storage module.
 */
export async function url(key?: StorageKey | string): Promise<string> {
  return (await getStore(key)).url();
}

/**
 * Check whether the delegated storage is writable in general, or at or below a particular key.
 * There still may be some sub-keys that differ.
 */
export async function isWritable(key: StorageKey = []): Promise<boolean> {
  return (await getStore(key)).isWritable(key);
}

/**
 * Determine whether a value is set for the given key in the delegated storage.
 */
export async function hasItem(key: StorageKey): Promise<boolean> {
  return (await getStore(key)).hasItem(key);
}

/**
 * Get a value for the given key from the delegated storage.
 */
export async function getItem<T>(key: StorageKey): Promise<T | undefined> {
  return (await getStore(key)).getItem(key) as Promise<T | undefined>;
}

/**
 * Set a value for the given key in the delegated storage.
 */
export async function setItem<T>(key: StorageKey, value: T): Promise<void> {
  return (await getStore(key)).setItem(key, value);
}

/**
 * Remove the value with the given key from the delegated storage.
 */
export async function removeItem(key: StorageKey): Promise<void> {
  return (await getStore(key)).removeItem(key);
}

/**
 * List all items beneath the given key prefix in the delegated storage.
 * At present, guaranteed ordering and reverse support is optional, and
 * dependent on the abilities of the delegated storage.
 */
export async function* listItems<T>(
  prefix: StorageKey = [],
  reverse = false,
): AsyncIterable<[StorageKey, T]> {
  yield* (await getStore(prefix)).listItems(prefix, reverse) as AsyncIterable<
    [StorageKey, T]
  >;
}

/**
 * Delete item and sub items recursively from the delegated storage and clean up.
 */
export async function clearItems(prefix: StorageKey): Promise<void> {
  return (await getStore(prefix)).clearItems(prefix);
}

/**
 * Close all associated resources in the delegated storage.
 * This isn't generally required in most situations, it's main use is within test cases.
 */
export async function close(): Promise<void> {
  const pending = [defaultStore, ...stores?.values() ?? []].map(async (store) =>
    (await store)?.close()
  );
  defaultStore = undefined;
  stores?.clear();
  stores = undefined;
  await Promise.allSettled(pending);
}
