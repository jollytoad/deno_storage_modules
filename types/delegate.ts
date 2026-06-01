import type { Awaitable, StorageKey } from "./common.ts";
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
   * Get the delegate store previously set via `setStore` or obtained
   * via another mechanism (eg. env vars)
   *
   * @deprecated Use `getDelegated` instead.
   *
   * @param key get the store specific to this key or prefix
   * @returns the promise of the store to which all operations are delegated
   * @throws if no store has been set or can be loaded
   */
  getStore(key?: StorageKey | string): Promise<StorageProvider>;

  /**
   * Returns the `import.meta.url` of the delegated store.
   *
   * @param key get the store specific to this key or prefix
   */
  url(key?: StorageKey | string): Promise<string>;

  /**
   * Get the delegate store config previously set via `setStore`.
   *
   * @param key get the store config specific to this key or prefix
   * @returns the delegate store config
   * @throws if no store has been set or can be loaded
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
}

/**
 * Internal configuration for a single delegate store entry.
 * Stores are identified by an optional prefix key; the mapKey function
 * transforms incoming keys according to the prefix mapping.
 */
export interface DelegatedStoreConfig {
  /** The storage provider (may be a promise). */
  store: Awaitable<StorageProvider>;
  /** Key transformation function applied before delegation. */
  mapKey: KeyMapper;
}

/** Map key transformation function used by DelegatedStoreConfig. */
export type KeyMapper = (key: StorageKey) => StorageKey;
