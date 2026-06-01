import type {
  Awaitable,
  DelegatedStoreConfig,
  DelegatedStoreOptions,
  DelegatingStore,
  KeyMapper,
  StorageKey,
  StorageModule,
  StorageProvider,
} from "@storage/types";
import * as fn from "@storage/fns";

({
  url,
  setStore,
  close,
  getDelegated,
}) satisfies DelegatingStore & Pick<StorageModule, "close">;

const stores = new Map<string | undefined, DelegatedStoreConfig>();

/**
 * Set the storage module to which all function calls are delegated
 *
 * @param store may be the store, promise of the store, or undefined
 *   to remove any delegate store
 * @param prefix the given storage module will only apply to keys with this
 *   prefix, if this is not supplied then the given storage module is set as
 *   the default/fallback store
 * @param options additional options
 */
export function setStore(
  store?: Awaitable<StorageProvider>,
  prefix?: string,
  options?: DelegatedStoreOptions,
) {
  if (store) {
    const { prefixMapping } = options ?? {};

    const mapKey: KeyMapper = prefixMapping
      ? prefix === undefined
        ? (key) => [...prefixMapping, ...key]
        : (key) => [...prefixMapping, ...key.slice(1)]
      : (key) => key;

    stores.set(prefix, {
      store,
      mapKey,
      ...options,
    });
  } else {
    stores.delete(prefix);
  }
}

/**
 * Look up the `DelegatedStoreConfig` for the given key, falling back
 * to the default store and then to `STORAGE_MODULE` env var.
 */
export function getDelegated(
  key?: StorageKey | string,
): DelegatedStoreConfig {
  if (key?.length) {
    const prefix = typeof key === "string" ? key : String(key[0]);
    if (prefix) {
      const entry = stores.get(prefix);
      if (entry) {
        return entry;
      }
    }
  }
  if (!stores.has(undefined)) {
    setStore(import("./_from_env.ts").then((m) => m.fromEnv()));
  }
  return stores.get(undefined)!;
}

/**
 * Returns the `url()` of the delegated storage module.
 */
export async function url(key?: StorageKey | string): Promise<string> {
  return (await getDelegated(key).store).url();
}

/**
 * Close all associated resources in the delegated storage.
 * This isn't generally required in most situations,
 * it's main use is within test cases.
 */
export async function close(): Promise<void> {
  const pending = [...stores.values()].map(
    async (entry) => fn.close(await entry.store),
  );
  stores.clear();
  await Promise.allSettled(pending);
}
