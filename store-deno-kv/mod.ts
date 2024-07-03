import type { StorageKey, StorageModule } from "@jollytoad/store-common/types";

export type { StorageKey, StorageModule };

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
}) satisfies StorageModule;

export function url(): Promise<string> {
  return Promise.resolve(import.meta.url);
}

export function isWritable(_key?: StorageKey): Promise<boolean> {
  return Promise.resolve(true);
}

export async function hasItem<T>(key: StorageKey): Promise<boolean> {
  return (await (await getKv(key)).get<T>(key, { consistency }))
    .versionstamp !== null;
}

export async function getItem<T>(key: StorageKey): Promise<T | undefined> {
  return (await (await getKv(key)).get<T>(key, { consistency })).value ??
    undefined;
}

export async function setItem<T>(key: StorageKey, value: T): Promise<void> {
  await (await getKv(key)).set(key, value);
}

export async function removeItem(key: StorageKey): Promise<void> {
  if (key.length) {
    await (await getKv(key)).delete(key);
  }
}

/**
 * Supports ordering and reverse based on the KV natural key ordering.
 */
export async function* listItems<T>(
  prefix: StorageKey = [],
  reverse = false,
): AsyncIterable<[StorageKey, T]> {
  for await (
    const entry of (await getKv(prefix)).list<T>({ prefix }, {
      consistency,
      reverse,
    })
  ) {
    yield [entry.key as StorageKey, entry.value];
  }
}

export async function clearItems(prefix: StorageKey): Promise<void> {
  const kv = await getKv(prefix);
  let op = kv.atomic();

  if (prefix.length) {
    op = op.delete(prefix);
  }

  for await (const { key } of kv.list({ prefix }, { consistency })) {
    op = op.delete(key);
  }

  await op.commit();
}

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
export async function getKv(_key: StorageKey): Promise<Deno.Kv> {
  const kvPath = Deno.env.get("STORE_KV_PATH") || undefined;

  let kv = kvCache.get(kvPath ?? "");

  if (!kv) {
    kv = await Deno.openKv(kvPath);
    kvCache.set(kvPath ?? "", kv);
  }

  return kv;
}
