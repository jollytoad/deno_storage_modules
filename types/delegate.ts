import type { Awaitable, StorageKey } from "./common.ts";
import type { StorageProvider } from "./provider.ts";

/**
 * Additional functions for a store that delegates to one or more other stores.
 */
export interface DelegatedStore {
  /**
   * Set the storage provider to which all function calls are delegated
   *
   * @param storageProvider may be the store, promise of the store,
   *   or undefined to remove any delegate store
   * @param prefix delegate only for StorageKeys starting with this prefix
   */
  setStore(
    storageProvider?: Awaitable<StorageProvider>,
    prefix?: string,
  ): void;

  /**
   * Get the delegate store previously set via `setStore` or obtained
   * via another mechanism (eg. env vars)
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
}
