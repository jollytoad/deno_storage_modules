/**
 * A key for an item in a store.
 *
 * An array of string, number or boolean.
 *
 * This may be translated to a format compatible with the underlying storage
 * mechanism, often a single string delimited by slashes `/` (or other
 * character), and where numbers and booleans are converted directly to
 * string format.
 */
export type StorageKey = readonly (string | number | boolean)[];

/**
 * A value that may be `await`ed.
 */
export type Awaitable<T> = T | PromiseLike<T>;
