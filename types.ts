/**
 * Describes the interface provided by each storage module
 */
export interface StorageModule<T = unknown> {
  /**
   * Check whether the storage is writable in general, or at or below a particular key.
   * There still may be some sub-keys that differ.
   */
  isWritable(key?: string[]): Promise<boolean>;

  /**
   * Determine whether a value is set for the given key.
   */
  hasItem(key: string[]): Promise<boolean>;

  /**
   * Get a value for the given key.
   */
  getItem(key: string[]): Promise<T | undefined>;

  /**
   * Set a value for the given key.
   */
  setItem(key: string[], value: T): Promise<void>;

  /**
   * Remove the value with the given key.
   */
  removeItem(key: string[]): Promise<void>;

  /**
   * List all items beneath the given key prefix.
   */
  listItems(prefix: string[]): AsyncIterable<[string[], T]>;

  /**
   * Close all associated resources.
   */
  close(): Promise<void>;
}
