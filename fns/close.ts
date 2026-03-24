import type { Awaitable, StorageProvider } from "@storage/types";

/**
 * Default implementation of close for stores that might
 * not implement it.
 */
export function close(store: StorageProvider): Awaitable<void> {
  return store.close?.();
}
