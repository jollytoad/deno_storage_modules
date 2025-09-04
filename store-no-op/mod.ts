import type {
  MinimalStorageModule,
  StorageKey,
  StorageModule,
} from "@jollytoad/store-common/types";

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

/**
 * Returns the `import.meta.url` of the module.
 */
export function url(): Promise<string> {
  return Promise.resolve(import.meta.url);
}

/**
 * Always false, as this is not a real storage mechanism.
 */
export function isWritable(_key: StorageKey = []): Promise<boolean> {
  return Promise.resolve(false);
}

/**
 * Always false, as this store holds no data.
 */
export function hasItem(_key: StorageKey): Promise<boolean> {
  return Promise.resolve(false);
}

/**
 * Always undefined, as this store holds no data.
 */
export function getItem<T>(_key: StorageKey): Promise<T | undefined> {
  return Promise.resolve(undefined);
}

/**
 * Does nothing, as this is not a real storage mechanism.
 */
export function setItem<T>(_key: StorageKey, _value: T): Promise<void> {
  return Promise.resolve();
}

/**
 * Does nothing, as this is not a real storage mechanism.
 */
export function removeItem(_key: StorageKey): Promise<void> {
  return Promise.resolve();
}

/**
 * Lists nothing, as this store holds no data.
 */
export async function* listItems<T>(
  _prefix: StorageKey = [],
  _reverse = false,
): AsyncIterable<[StorageKey, T]> {
  // do nothing
}

/**
 * Does nothing, as this is not a real storage mechanism.
 */
export function clearItems(_prefix: StorageKey): Promise<void> {
  return Promise.resolve();
}

/**
 * Does nothing, as this is not a real storage mechanism.
 */
export function close(): Promise<void> {
  return Promise.resolve();
}
