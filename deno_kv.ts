const consistency: Deno.KvConsistencyLevel = "eventual";

export function isWritable(_key?: string[]): Promise<boolean> {
  return Promise.resolve(true);
}

export async function hasItem<T>(key: string[]): Promise<boolean> {
  return (await (await getKv(key)).get<T>(key, { consistency }))
    .versionstamp !== null;
}

export async function getItem<T>(key: string[]): Promise<T | undefined> {
  return (await (await getKv(key)).get<T>(key, { consistency })).value ??
    undefined;
}

export async function setItem<T>(key: string[], value: T): Promise<void> {
  await (await getKv(key)).set(key, value);
}

export async function removeItem(key: string[]): Promise<void> {
  await (await getKv(key)).delete(key);
}

export async function* listItems<T>(
  prefix: string[] = [],
): AsyncIterable<[readonly string[], T]> {
  for await (
    const entry of (await getKv(prefix)).list<T>({ prefix }, { consistency })
  ) {
    yield [entry.key as string[], entry.value];
  }
}

export async function close() {
  const kvs = [...kvCache.values()];
  kvCache.clear();
  await Promise.all(kvs.map((kv) => kv.close()));
}

const kvCache = new Map<string, Deno.Kv>();

async function getKv(_key: string[]): Promise<Deno.Kv> {
  const kvPath = Deno.env.get("STORE_KV_PATH") || undefined;

  let kv = kvCache.get(kvPath ?? "");

  if (!kv) {
    kv = await Deno.openKv(kvPath);
    kvCache.set(kvPath ?? "", kv);
  }

  return kv;
}
