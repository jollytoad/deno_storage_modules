import type { Awaitable, StorageKey } from "./common.ts";
import type {
  BatchOptions,
  GetItemsOptions,
  ListItemsOptions,
  SetItemOptions,
} from "./consumer.ts";
import type { StorageProvider } from "./provider.ts";

/**
 * Additional functions for a store that delegates to one or more other stores.
 */
export interface DelegatingStore {
  /**
   * Set the storage provider to which all function calls are delegated
   *
   * @param storageProvider may be the store, promise of the store,
   *   or undefined to remove any delegate store
   * @param prefix delegate only for StorageKeys starting with this prefix
   * @param options additional options
   */
  setStore(
    storageProvider?: Awaitable<StorageProvider>,
    prefix?: string,
    options?: DelegatedStoreOptions,
  ): void;

  /**
   * Returns the `import.meta.url` of the delegated store.
   *
   * @param key get the store specific to this key or prefix
   */
  url(key?: StorageKey | string): Promise<string>;

  /**
   * Get the delegate store config previously set via `setStore`.
   * The returned config's `store` promise will reject if no store has
   * been set or can be loaded.
   *
   * @param key get the store config specific to this key or prefix
   * @returns the delegate store config
   */
  getDelegated(key?: StorageKey | string): DelegatedStoreConfig;
}

/**
 * Options for `DelegatingStore.setStore`.
 */
export interface DelegatedStoreOptions {
  /**
   * Replaces the first element of the key with this array before passing
   * to the delegate; defaults to `[prefix]` (no change), pass `[]` to
   * strip the prefix entirely.
   */
  prefixMapping?: StorageKey;

  /**
   * Default options for `setItem` calls to this store.
   * These will be merged with (and overridden by) any per-call options.
   */
  setItemOptions?: SetItemOptions;

  /**
   * Default options for `listItems`, `listValues`, and `listKeys` calls
   * to this store.
   * These will be merged with (and overridden by) any per-call options.
   */
  listItemsOptions?: ListItemsOptions;

  /**
   * Default options for `getItems` calls to this store.
   * These will be merged with (and overridden by) any per-call options.
   */
  getItemsOptions?: GetItemsOptions;

  /**
   * Default options for `batch` / `commit` calls to this store.
   * These will be merged with (and overridden by) any per-call options.
   */
  batchOptions?: BatchOptions;
}

/**
 * Configuration for a single delegate store.
 * Stores are identified by an optional prefix key; the mapKey function
 * transforms incoming keys according to the prefix mapping.
 */
export interface DelegatedStoreConfig extends DelegatedStoreOptions {
  /**
   * The storage provider (may be a promise).
   */
  store: Awaitable<StorageProvider>;

  /**
   * Key transformation function applied before delegation.
   */
  mapKey: KeyMapper;
}

/**
 * Map key transformation function used by DelegatedStoreConfig.
 */
export type KeyMapper = (key: StorageKey) => StorageKey;
