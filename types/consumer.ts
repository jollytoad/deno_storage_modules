import type { Awaitable, StorageKey } from "./common.ts";

/**
 * The complete set of Storage functions.
 */
export interface StorageModule {
  /**
   * Returns the `import.meta.url` of the module.
   */
  url(): Promise<string>;

  /**
   * Check whether the storage is writable in general, or at or below
   * a particular key.
   * There still may be some sub-keys that differ.
   */
  isWritable(key?: StorageKey): Promise<boolean>;

  /**
   * Explicitly close the underlying storage mechanism.
   * Mainly for use in test cases.
   */
  close(): Awaitable<void>;

  /**
   * Determine whether a value is set for the given key.
   */
  hasItem(key: StorageKey): Promise<boolean>;

  /**
   * Get a value for the given key.
   */
  getItem<T>(key: StorageKey): Promise<T | undefined>;

  /**
   * Get multiple items.
   * Items are returned in key -> value pairs in any order, not necessarily in
   * the same order as the given keys.
   * Duplicated keys should be ignored, so the results should not contain
   * duplicate items.
   */
  getItems<T>(
    keys: Iterable<StorageKey>,
    options?: GetItemsOptions,
  ): AsyncIterable<[StorageKey, T]>;

  /**
   * List all items (key -> value pairs), beneath the given key prefix.
   * At present, guaranteed ordering and reverse support is optional.
   */
  listItems<T>(
    prefix?: StorageKey,
    options?: ListItemsOptions,
  ): AsyncIterable<[StorageKey, T]>;

  /**
   * List all item values, beneath the given key prefix.
   */
  listValues<T>(
    prefix?: StorageKey,
    options?: ListItemsOptions,
  ): AsyncIterable<T>;

  /**
   * List all item keys beneath the given key prefix.
   */
  listKeys(
    prefix?: StorageKey,
    options?: ListItemsOptions,
  ): AsyncIterable<StorageKey>;

  /**
   * Set a value for the given key.
   */
  setItem<T>(
    key: StorageKey,
    value: T,
    options?: SetItemOptions,
  ): Promise<void>;

  /**
   * Remove the value with the given key.
   */
  removeItem(key: StorageKey): Promise<void>;

  /**
   * Delete item and sub items recursively and clean up.
   */
  clearItems(prefix: StorageKey): Promise<void>;

  /**
   * Copy an item and all sub items to a new key.
   */
  copyItems(fromPrefix: StorageKey, toPrefix: StorageKey): Promise<void>;

  /**
   * Move an item and all sub items to a new key.
   */
  moveItems(fromPrefix: StorageKey, toPrefix: StorageKey): Promise<void>;

  /**
   * Start a batch of operations.
   */
  batch<T>(
    fn: BatchedFn<T>,
    options?: BatchOptions,
  ): Promise<T>;
}

/**
 * Options for `getItems`
 */
export interface GetItemsOptions {
  /**
   * Max concurrency if many operations/requests are required.
   */
  concurrency?: number;
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
   * Set the preferred page size for storage mechanisms that fetch via
   * paged requests.
   */
  pageSize?: number;
}

/**
 * Options for `setItem`
 */
export interface SetItemOptions {
  /**
   * Set an expiry time (in milliseconds) for this item, support for this is optional.
   */
  expireIn?: number;
}

/**
 * Set of storage provider function names that are batched
 */
export type BatchableFnName =
  & string
  & keyof Pick<StorageModule, "setItem" | "removeItem">;

/**
 * Options for `commit` function
 */
export interface BatchOptions {
  /**
   * Maximum number of concurrent operations to perform when committing.
   */
  concurrency?: number;

  /**
   * Indicate the atomic behaviour of the commit.
   *
   * Atomic transactions cannot be guaranteed for any Storage provider
   * at present, but `preferred` can be given to indicate that an atomic
   * transaction should be used if possible.
   */
  atomic?: "preferred";
}

/**
 * Control functions passed the callback function of a batch.
 */
export interface BatchControl {
  /**
   * Explicitly force the batch to commit, and begin a new batch.
   */
  commit(): Promise<void>;

  /**
   * Abort the existing batch, discarding all buffered operations.
   * Like commit, a new batch will be started.
   */
  abort(): Promise<void>;
}

/**
 * The body function of a batch. Passed to `batch`, and called immediately.
 *
 * @param control functions to `commit`, or `abort` the current batch
 */
export type BatchedFn<T> = (control: BatchControl) => Promise<T>;
