import type { StorageKey, StorageModule } from "@jollytoad/store-common/types";

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
}) satisfies StorageModule;

export function url(): Promise<string> {
  return Promise.resolve(import.meta.url);
}

export function isWritable(_key: StorageKey = []): Promise<boolean> {
  return Promise.resolve(false);
}

export function hasItem(_key: StorageKey): Promise<boolean> {
  return Promise.resolve(false);
}

export function getItem<T>(_key: StorageKey): Promise<T | undefined> {
  return Promise.resolve(undefined);
}

export function setItem<T>(_key: StorageKey, _value: T): Promise<void> {
  return Promise.resolve();
}

export function removeItem(_key: StorageKey): Promise<void> {
  return Promise.resolve();
}

export async function* listItems<T>(
  _prefix: StorageKey = [],
  _reverse = false,
): AsyncIterable<[StorageKey, T]> {
  // do nothing
}

export function clearItems(_prefix: StorageKey): Promise<void> {
  return Promise.resolve();
}

export function close(): Promise<void> {
  return Promise.resolve();
}
