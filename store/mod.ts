import type {
  DelegatedStore,
  StorageKey,
  StorageModule,
} from "@jollytoad/store-common/types";

export type { DelegatedStore, StorageKey, StorageModule };

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
  setStore,
  getStore,
}) satisfies StorageModule & DelegatedStore;

let store: Promise<StorageModule> | undefined;

export function setStore(
  storageModule?: StorageModule | Promise<StorageModule>,
) {
  store = storageModule ? Promise.resolve(storageModule) : undefined;
}

export async function getStore(): Promise<StorageModule> {
  if (!store) {
    store = (await import("./_from_env.ts")).fromEnv();
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
  return (await getStore()).clearItems(prefix);
}

export async function close(): Promise<void> {
  (await store)?.close();
}
