import { fromStrKey, toStrKey } from "@storage/util/key-string";
import type {
  ListItemsOptions,
  SetItemOptions,
  StorageKey,
  StorageProvider,
} from "@storage/types";

({
  isWritable,
  hasItem,
  getItem,
  setItem,
  removeItem,
  listItems,
  listKeys,
  close,
  url,
}) satisfies StorageProvider;

const SEP = "\0";

const map = new Map<string, string>();
const expiryTimers = new Map<string, ReturnType<typeof setTimeout>>();

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
  return Promise.resolve(map.has(storageKey(key)));
}

/**
 * Get a value for the given key.
 */
export function getItem<T>(key: StorageKey): Promise<T | undefined> {
  const json = map.get(storageKey(key));
  if (json !== undefined) {
    return Promise.resolve(JSON.parse(json));
  }
  return Promise.resolve(undefined);
}

/**
 * Set a value for the given key.
 * Supports the `expireIn` option, using `setTimeout` for expiry.
 */
export function setItem<T>(
  key: StorageKey,
  value: T,
  options?: SetItemOptions,
): Promise<void> {
  const sk = storageKey(key);
  map.set(sk, JSON.stringify(value));

  if (options?.expireIn) {
    clearExpiry(sk);
    const timer = setTimeout(() => {
      map.delete(sk);
      expiryTimers.delete(sk);
    }, options.expireIn);
    expiryTimers.set(sk, timer);
  }

  return Promise.resolve();
}

/**
 * Remove the value with the given key.
 */
export function removeItem(key: StorageKey): Promise<void> {
  const sk = storageKey(key);
  map.delete(sk);
  clearExpiry(sk);
  return Promise.resolve();
}

/**
 * List all items beneath the given key prefix.
 * At present ordering is not guaranteed and reverse support is optional.
 */
export async function* listItems<T>(
  keyPrefix: StorageKey = [],
  _options?: ListItemsOptions,
): AsyncIterable<[StorageKey, T]> {
  const prefix = keyPrefix.length ? storageKey(keyPrefix) + SEP : "";

  for (const [key, json] of map) {
    if (key.startsWith(prefix)) {
      yield [fromStrKey(key.split(SEP)), JSON.parse(json)];
    }
  }
}

/**
 * List all keys beneath the given key prefix.
 */
export async function* listKeys(
  prefix: StorageKey = [],
  _options?: ListItemsOptions,
): AsyncIterable<StorageKey> {
  const prefixStr = prefix.length ? storageKey(prefix) + SEP : "";

  for (const key of map.keys()) {
    if (key.startsWith(prefixStr)) {
      yield fromStrKey(key.split(SEP));
    }
  }
}

/**
 * Close the store, clearing all data and pending expiry timers.
 */
export function close(): Promise<void> {
  for (const timer of expiryTimers.values()) {
    clearTimeout(timer);
  }
  expiryTimers.clear();
  map.clear();
  return Promise.resolve();
}

function storageKey(key: StorageKey) {
  return toStrKey(key).join(SEP);
}

function clearExpiry(sk: string) {
  const timer = expiryTimers.get(sk);
  if (timer !== undefined) {
    clearTimeout(timer);
    expiryTimers.delete(sk);
  }
}
