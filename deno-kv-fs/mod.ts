import * as kv from "@storage/deno-kv";
import * as fs from "@storage/deno-fs";
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
export async function isWritable(key: StorageKey = []): Promise<boolean> {
  if (key.length && isFsPrimary() && await fs.hasItem(key)) {
    return false;
  }
  return kv.isWritable(key);
}

/**
 * Determine whether a value is set for the given key.
 */
export async function hasItem(key: StorageKey): Promise<boolean> {
  return await fs.hasItem(key) || await kv.hasItem(key);
}

/**
 * Get a value for the given key.
 */
export async function getItem<T>(key: StorageKey): Promise<T | undefined> {
  if (isFsPrimary()) {
    return await fs.getItem(key) ?? await kv.getItem(key);
  } else {
    return await kv.getItem(key) ?? await fs.getItem(key);
  }
}

/**
 * Set a value for the given key.
 * Does not support the `expireIn` option.
 */
export async function setItem<T>(
  key: StorageKey,
  value: T,
  _options?: SetItemOptions,
): Promise<void> {
  if (isFsPrimary() && await fs.hasItem(key)) {
    // Prevent saving of value that already exists in filesystem
    return;
  }
  await kv.setItem(key, value);
}

/**
 * Remove the value with the given key.
 */
export async function removeItem(key: StorageKey): Promise<void> {
  await kv.removeItem(key);
}

/**
 * List all items beneath the given key prefix.
 * At present, guaranteed ordering and reverse support is optional.
 */
export async function* listItems<T>(
  prefix: StorageKey = [],
  options?: ListItemsOptions,
): AsyncIterable<[StorageKey, T]> {
  if (isFsPrimary()) {
    yield* fs.listItems(prefix, options);
    // TODO: skip items already listed from FS
    yield* kv.listItems(prefix, options);
  } else {
    yield* kv.listItems(prefix, options);
    // TODO: skip items already listed from KV
    yield* fs.listItems(prefix, options);
  }
}

/**
 * Delete item and sub items recursively and clean up.
 */
export async function clearItems(prefix: StorageKey): Promise<void> {
  await kv.clearItems(prefix);
}

/**
 * Close all associated resources.
 * This isn't generally required in most situations, it's main use is within test cases.
 */
export function close(): Promise<void> {
  return kv.close();
}

/**
 * Get the underlying `Deno.Kv` connection, to allow use of more specialized facilities
 * such as transactions.
 */
export function getDenoKv(key: StorageKey): Promise<Deno.Kv> {
  return kv.getDenoKv(key);
}

function isFsPrimary(): boolean {
  return Deno.env.get("STORE_PRIMARY") !== "kv";
}
