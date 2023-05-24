import * as kv from "./deno_kv.ts";
import * as fs from "./deno_fs.ts";
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
): AsyncIterable<[StorageKey, T]> {
  if (isFsPrimary()) {
    yield* fs.listItems(prefix);
    yield* kv.listItems(prefix);
  } else {
    yield* kv.listItems(prefix);
    yield* fs.listItems(prefix);
  }
}

export async function clearItems(prefix: StorageKey) {
  await kv.clearItems(prefix);
}

export function close() {
  return kv.close();
}

function isFsPrimary(): boolean {
  return Deno.env.get("STORE_PRIMARY") !== "kv";
}
