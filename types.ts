export type StorageKey = readonly string[];

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
   */
  listItems(prefix?: StorageKey): AsyncIterable<[StorageKey, T]>;

  /**
   * Delete item and sub items recursively and clean up.
   */
  clearItems(prefix: StorageKey): Promise<void>;

  /**
   * Close all associated resources.
   */
  close(): Promise<void>;
}
