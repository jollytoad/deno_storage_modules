import type { StorageKey } from "@storage/types";

/**
 * Create a filter for unique StorageKeys.
 * For use with `asyncFilter`.
 *
 * This caches the keys internally, so the returned filter must be created
 * before each use.
 *
 * @param keyHash a function to convert the StorageKey to a string that is used
 *   as the unique hash of the key (defaults to JSON.stringify)
 *
 * @example
 * ```ts
 *   const uniqueKeys = asyncFilter(duplicateKeys, uniqueKeyFilter())
 * ```
 */
export function uniqueKeyFilter(
  keyHash: (key: StorageKey) => string = JSON.stringify,
): (key: StorageKey) => boolean {
  const seen = new Set<string>();
  return (key) => {
    const hash = keyHash(key);
    if (seen.has(hash)) return false;
    seen.add(hash);
    return true;
  };
}
