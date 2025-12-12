/**
 * A key for an item in a store.
 *
 * An array of string, number or boolean.
 * This may be translated to a format compatible with the underlying storage mechanism,
 * often a single string delimited by slashes `/`, and where numbers and booleans are
 * converted directly to string format.
 */
export type StorageKey = readonly (string | number | boolean)[];

/**
 * Describes the common interface provided by each storage module
 */
export type StorageModule<T = unknown> =
  & MinimalStorageModule<T>
  & Partial<ExtendedStorageModule>;

/**
 * Describes a storage module that provides all functions
 */
export type CompleteStorageModule<T = unknown> =
  & MinimalStorageModule<T>
  & ExtendedStorageModule;

/**
 * Describes the minimal interface that must be provided by each storage module
 */
export interface MinimalStorageModule<T = unknown> {
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
    options?: ListItemsOptions,
  ): AsyncIterable<[StorageKey, T]>;

  /**
   * Delete item and sub items recursively and clean up.
   */
  clearItems(prefix: StorageKey): Promise<void>;

  /**
   * Close all associated resources.
   * This isn't generally required in most situations, it's main use is within test cases.
   */
  close(): Promise<void>;

  /**
   * Returns the `import.meta.url` of the module.
   */
  url(): Promise<string>;
}

/**
 * Options for `listItems`
 */
export interface ListItemsOptions {
  /**
   * Reverse the order of the query, support for this is optional.
   */
  reverse?: boolean;
  /**
   * Set the preferred page size for storage mechanisms that fetch via paged requests.
   */
  pageSize?: number;
}

/**
 * Describes an optional extended interface that may be provided by a storage module
 */
export interface ExtendedStorageModule {
  /**
   * Copy an item and all sub items to a new key.
   */
  copyItems(fromPrefix: StorageKey, toPrefix: StorageKey): Promise<void>;

  /**
   * Move an item and all sub items to a new key.
   */
  moveItems(fromPrefix: StorageKey, toPrefix: StorageKey): Promise<void>;
}

/**
 * Additional functions for a store that delegates to one or more other stores
 */
export interface DelegatedStore {
  /**
   * Set the storage module to which all function calls are delegated
   *
   * @param storageModule may be the store, promise of the store, or undefined to remove any delegate store
   * @param prefix delegate only for StorageKeys starting with this prefix
   */
  setStore(
    storageModule?: Awaitable<StorageModule>,
    prefix?: string,
  ): void;

  /**
   * Get the delegate store previously set via `setStore` or obtained via another mechanism (eg. env vars)
   *
   * @param key get the store specific to this key or prefix
   * @returns the promise of the store to which all operations are delegated
   * @throws if no store has been set or can be loaded
   */
  getStore(key?: StorageKey | string): Promise<StorageModule>;

  /**
   * Returns the `import.meta.url` of the module.
   *
   * @param key get the store specific to this key or prefix
   */
  url(key?: StorageKey | string): Promise<string>;
}

/**
 * A value that may be `await`ed.
 */
export type Awaitable<T> = T | Promise<T>;
