import * as kv from "@jollytoad/store-deno-kv";
import * as fs from "@jollytoad/store-deno-fs";
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

export async function isWritable(key: StorageKey = []): Promise<boolean> {
  if (key.length && isFsPrimary() && await fs.hasItem(key)) {
    return false;
  }
  return kv.isWritable(key);
}

export async function hasItem(key: StorageKey): Promise<boolean> {
  return await fs.hasItem(key) || await kv.hasItem(key);
}

export async function getItem<T>(key: StorageKey): Promise<T | undefined> {
  if (isFsPrimary()) {
    return await fs.getItem(key) ?? await kv.getItem(key);
  } else {
    return await kv.getItem(key) ?? await fs.getItem(key);
  }
}

export async function setItem<T>(key: StorageKey, value: T): Promise<void> {
  if (isFsPrimary() && await fs.hasItem(key)) {
    // Prevent saving of value that already exists in filesystem
    return;
  }
  await kv.setItem(key, value);
}

export async function removeItem(key: StorageKey): Promise<void> {
  await kv.removeItem(key);
}

export async function* listItems<T>(
  prefix: StorageKey = [],
  reverse = false,
): AsyncIterable<[StorageKey, T]> {
  if (isFsPrimary()) {
    yield* fs.listItems(prefix, reverse);
    // TODO: skip items already listed from FS
    yield* kv.listItems(prefix, reverse);
  } else {
    yield* kv.listItems(prefix, reverse);
    // TODO: skip items already listed from KV
    yield* fs.listItems(prefix, reverse);
  }
}

export async function clearItems(prefix: StorageKey) {
  await kv.clearItems(prefix);
}

export function close(): Promise<void> {
  return kv.close();
}

function isFsPrimary(): boolean {
  return Deno.env.get("STORE_PRIMARY") !== "kv";
}
