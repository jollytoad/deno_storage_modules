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

let store: Promise<StorageModule> | undefined;

export function setStore(
  storageModule?: StorageModule | Promise<StorageModule>,
) {
  store = storageModule ? Promise.resolve(storageModule) : undefined;
}

export async function getStore(): Promise<StorageModule> {
  if (!store) {
    const moduleSpecifier = Deno.env.get("STORAGE_MODULE");
    if (moduleSpecifier) {
      store = import(import.meta.resolve(moduleSpecifier));
    } else {
      throw new Error(
        "A StorageModule was not selected, either via `setStore()`, or the `STORAGE_MODULE` env var",
      );
    }
  }
  return await store;
}

export async function url(): Promise<string> {
  return (await getStore()).url();
}

export async function isWritable(key: StorageKey = []): Promise<boolean> {
  return (await getStore()).isWritable(key);
}

export async function hasItem(key: StorageKey): Promise<boolean> {
  return (await getStore()).hasItem(key);
}

export async function getItem<T>(key: StorageKey): Promise<T | undefined> {
  return (await getStore()).getItem(key) as Promise<T | undefined>;
}

export async function setItem<T>(key: StorageKey, value: T): Promise<void> {
  return (await getStore()).setItem(key, value);
}

export async function removeItem(key: StorageKey): Promise<void> {
  return (await getStore()).removeItem(key);
}

export async function* listItems<T>(
  prefix: StorageKey = [],
  reverse = false,
): AsyncIterable<[StorageKey, T]> {
  yield* (await getStore()).listItems(prefix, reverse) as AsyncIterable<
    [StorageKey, T]
  >;
}

export async function clearItems(prefix: StorageKey): Promise<void> {
  await getStore();
  return (await getStore()).clearItems(prefix);
}

export async function close(): Promise<void> {
  if (store) {
    (await store)?.close();
  }
}
