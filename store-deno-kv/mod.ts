import type {
  MinimalStorageModule,
  StorageKey,
  StorageModule,
} from "@jollytoad/store-common/types";
import type { ExposeDenoKv } from "./types.ts";

export type { ExposeDenoKv, StorageKey, StorageModule };

const consistency: Deno.KvConsistencyLevel = "eventual";

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
  getDenoKv,
}) satisfies MinimalStorageModule & ExposeDenoKv;

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

export async function hasItem<T>(key: StorageKey): Promise<boolean> {
  return (await (await getDenoKv(key)).get<T>(key, { consistency }))
    .versionstamp !== null;
}

/**
 * Get a value for the given key.
 */
export async function getItem<T>(key: StorageKey): Promise<T | undefined> {
  return (await (await getDenoKv(key)).get<T>(key, { consistency })).value ??
    undefined;
}

/**
 * Set a value for the given key.
 */
export async function setItem<T>(key: StorageKey, value: T): Promise<void> {
  await (await getDenoKv(key)).set(key, value);
}

/**
 * Remove the value with the given key.
 */
export async function removeItem(key: StorageKey): Promise<void> {
  if (key.length) {
    await (await getDenoKv(key)).delete(key);
  }
}

/**
 * List all items beneath the given key prefix.
 * Supports ordering and reverse based on the KV natural key ordering.
 */
export async function* listItems<T>(
  prefix: StorageKey = [],
  reverse = false,
): AsyncIterable<[StorageKey, T]> {
  for await (
    const entry of (await getDenoKv(prefix)).list<T>({ prefix }, {
      consistency,
      reverse,
    })
  ) {
    yield [entry.key as StorageKey, entry.value];
  }
}

/**
 * Delete item and sub items recursively and clean up.
 */
export async function clearItems(prefix: StorageKey): Promise<void> {
  const kv = await getDenoKv(prefix);
  let op = kv.atomic();

  if (prefix.length) {
    op = op.delete(prefix);
  }

  for await (const { key } of kv.list({ prefix }, { consistency })) {
    op = op.delete(key);
  }

  await op.commit();
}

/**
 * Close all associated resources.
 * This isn't generally required in most situations, it's main use is within test cases.
 */
export async function close(): Promise<void> {
  const kvs = [...kvCache.values()];
  kvCache.clear();
  await Promise.all(kvs.map((kv) => kv.close()));
}

const kvCache = new Map<string, Deno.Kv>();

/**
 * Get the underlying `Deno.Kv` database.
 *
 * Useful to be able to perform more advanced transactional operations where necessary.
 */
export async function getDenoKv(_key: StorageKey): Promise<Deno.Kv> {
  const kvPath = Deno.env.get("STORE_KV_PATH") || undefined;

  let kv = kvCache.get(kvPath ?? "");

  if (!kv) {
    kv = await Deno.openKv(kvPath);
    kvCache.set(kvPath ?? "", kv);
  }

  return kv;
}
