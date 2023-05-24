import { fromStrKey, toStrKey } from "./_key_util.ts";
import type { StorageKey, StorageModule } from "./types.ts";

({
  isWritable,
  hasItem,
  getItem,
  setItem,
  removeItem,
  listItems,
  clearItems,
  close,
}) satisfies StorageModule;

const SEP = "/";

export function isWritable(_key?: StorageKey): Promise<boolean> {
  return Promise.resolve(true);
}

export function hasItem(key: StorageKey): Promise<boolean> {
  return Promise.resolve(localStorage.getItem(storageKey(key)) !== null);
}

export function getItem<T>(key: StorageKey): Promise<T | undefined> {
  const json = localStorage.getItem(storageKey(key));
  if (typeof json === "string") {
    return Promise.resolve(JSON.parse(json));
  }
  return Promise.resolve(undefined);
}

export function setItem<T>(key: StorageKey, value: T): Promise<void> {
  localStorage.setItem(storageKey(key), JSON.stringify(value));
  return Promise.resolve();
}

export function removeItem(key: StorageKey): Promise<void> {
  localStorage.removeItem(storageKey(key));
  return Promise.resolve();
}

export async function* listItems<T>(
  keyPrefix: StorageKey = [],
): AsyncIterable<[StorageKey, T]> {
  const prefix = keyPrefix.length ? storageKey(keyPrefix) + SEP : "";
  for (let i = 0; i < localStorage.length; i++) {
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

export function close() {
  return Promise.resolve();
}

function storageKey(key: StorageKey) {
  return toStrKey(key).join(SEP);
}
