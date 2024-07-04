export type StorageKey = readonly (string | number | boolean)[];

/**
 * Describes the interface provided by each storage module
 */
export interface StorageModule<T = unknown> {
  /**
   * Check whether the storage is writable in general, or at or below a particular key.
   * There still may be some sub-keys that differ.
   */
  isWritable(key?: StorageKey): Promise<boolean>;

  /**
   * Determine whether a value is set for the given key.
   */
  hasItem(key: StorageKey): Promise<boolean>;

  /**
   * Get a value for the given key.
   */
  getItem(key: StorageKey): Promise<T | undefined>;

  /**
   * Set a value for the given key.
   */
  setItem(key: StorageKey, value: T): Promise<void>;

  /**
   * Remove the value with the given key.
   */
  removeItem(key: StorageKey): Promise<void>;

  /**
   * List all items beneath the given key prefix.
   * At present, guaranteed ordering and reverse support is optional.
   */
  listItems(
    prefix?: StorageKey,
    reverse?: boolean,
  ): AsyncIterable<[StorageKey, T]>;

  /**
   * Delete item and sub items recursively and clean up.
   */
  clearItems(prefix: StorageKey): Promise<void>;

  /**
   * Close all associated resources.
   */
  close(): Promise<void>;

  /**
   * Returns the `import.meta.url` of the module.
   */
  url(): Promise<string>;
}

/**
 * Additional functions for a store that delegates to another store
 */
export interface DelegatedStore {
  /**
   * Set the store to which to delegate all function calls
   *
   * @param storageModule may be the store, promise of the store, or undefined to remove any delegate store
   */
  setStore(storageModule?: StorageModule | Promise<StorageModule>): void;

  /**
   * Get the delegate store previously set via `setStore` or obtained via another mechanism (eg. env vars)
   *
   * @returns the promise of the store to which all operations are delegated
   * @throws if no store has been set or can be loaded
   */
  getStore(): Promise<StorageModule>;
}
