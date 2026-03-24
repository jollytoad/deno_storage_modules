import type {
  Awaitable,
  DelegatedStore,
  StorageKey,
  StorageModule,
  StorageProvider,
} from "@storage/types";
import * as fn from "@storage/fns";

({
  url,
  setStore,
  getStore,
  close,
}) satisfies DelegatedStore & Pick<StorageModule, "close">;

let defaultStore: Promise<StorageProvider> | undefined;
let stores: Map<string, Promise<StorageProvider>> | undefined;

/**
 * Set the storage module to which all function calls are delegated
 *
 * @param storageProvider may be the store, promise of the store, or undefined
 *   to remove any delegate store
 * @param prefix the given storage module will only apply to keys with this
 *   prefix, if this is not supplied then the given storage module is set as
 *   the default/fallback store
 */
export function setStore(
  storageProvider?: Awaitable<StorageProvider>,
  prefix?: string,
) {
  if (prefix === undefined) {
    defaultStore = storageProvider
      ? Promise.resolve(storageProvider)
      : undefined;
  } else if (storageProvider) {
    stores ??= new Map();
    stores.set(prefix, Promise.resolve(storageProvider));
  } else {
    stores?.delete(prefix);
  }
}

/**
 * Get the delegate storage module previously set via `setStore`,
 * if one has not been set it will attempt to dynamically import the module
 * declared in the `STORAGE_MODULE` environment variable.
 *
 * @returns the promise of the store to which all operations are delegated
 * @throws if no store or env var has been set, or if dynamic import fails
 */
export async function getStore(
  key?: StorageKey | string,
): Promise<StorageProvider> {
  if (key && key.length) {
    const prefix = typeof key === "string" ? key : String(key[0]);
    if (prefix) {
      const store = stores?.get(prefix);
      if (store) {
        return store;
      }
    }
  }
  if (!defaultStore) {
    defaultStore = (await import("./_from_env.ts")).fromEnv();
  }
  return await defaultStore;
}

/**
 * Returns the `url()` of the delegated storage module.
 */
export async function url(key?: StorageKey | string): Promise<string> {
  return (await getStore(key)).url();
}

/**
 * Close all associated resources in the delegated storage.
 * This isn't generally required in most situations,
 * it's main use is within test cases.
 */
export async function close(): Promise<void> {
  const pending = [defaultStore, ...stores?.values() ?? []].map(async (store) =>
    store ? fn.close(await store) : undefined
  );
  defaultStore = undefined;
  stores?.clear();
  stores = undefined;
  await Promise.allSettled(pending);
}
