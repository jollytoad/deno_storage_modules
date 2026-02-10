import { fromStrKey, toStrKey } from "@storage/common/key-utils";
import type {
  ListItemsOptions,
  MinimalStorageModule,
  SetItemOptions,
  StorageKey,
  StorageModule,
} from "@storage/common/types";

export type { StorageKey, StorageModule };

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
}) satisfies MinimalStorageModule;

const SEP = "/";

/**
 * Returns the `import.meta.url` of the module.
 */
export function url(): Promise<string> {
  return Promise.resolve(import.meta.url);
}

/**
 * Check whether the storage is writable in general, or at or below a particular key.
 * There still may be some sub-keys that differ.
 */
export function isWritable(_key?: StorageKey): Promise<boolean> {
  return Promise.resolve(true);
}

/**
 * Determine whether a value is set for the given key.
 */
export function hasItem(key: StorageKey): Promise<boolean> {
  return Promise.resolve(localStorage.getItem(storageKey(key)) !== null);
}

/**
 * Get a value for the given key.
 */
export function getItem<T>(key: StorageKey): Promise<T | undefined> {
  const json = localStorage.getItem(storageKey(key));
  if (typeof json === "string") {
    return Promise.resolve(JSON.parse(json));
  }
  return Promise.resolve(undefined);
}

/**
 * Set a value for the given key.
 * Does not support the `expireIn` option.
 */
export function setItem<T>(
  key: StorageKey,
  value: T,
  _options?: SetItemOptions,
): Promise<void> {
  localStorage.setItem(storageKey(key), JSON.stringify(value));
  return Promise.resolve();
}

/**
 * Remove the value with the given key.
 */
export function removeItem(key: StorageKey): Promise<void> {
  localStorage.removeItem(storageKey(key));
  return Promise.resolve();
}

/**
 * List all items beneath the given key prefix.
 * At present, guaranteed ordering and reverse support is optional.
 */
export async function* listItems<T>(
  keyPrefix: StorageKey = [],
  options?: ListItemsOptions,
): AsyncIterable<[StorageKey, T]> {
  const reverse = options?.reverse ?? false;
  const prefix = keyPrefix.length ? storageKey(keyPrefix) + SEP : "";

  for (
    let i = reverse ? localStorage.length - 1 : 0;
    reverse ? i >= 0 : i < localStorage.length;
    reverse ? i-- : i++
  ) {
    const key = localStorage.key(i);
    if (key && key.startsWith(prefix)) {
      const json = localStorage.getItem(key);
      if (json) {
        try {
          yield [fromStrKey(key.split(SEP)), JSON.parse(json)];
        } catch (e) {
          console.error(e);
        }
      }
    }
  }
}

/**
 * Delete item and sub items recursively and clean up.
 */
export function clearItems(keyPrefix: StorageKey): Promise<void> {
  const queued: string[] = [storageKey(keyPrefix)];

  const prefix = keyPrefix.length ? storageKey(keyPrefix) + SEP : "";
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(prefix)) {
      queued.push(key);
    }
  }

  queued.forEach((key) => localStorage.removeItem(key));

  return Promise.resolve();
}

/**
 * Close all associated resources.
 * This isn't generally required in most situations, it's main use is within test cases.
 */
export function close(): Promise<void> {
  return Promise.resolve();
}

function storageKey(key: StorageKey) {
  return toStrKey(key).join(SEP);
}
