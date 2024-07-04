import type { StorageKey } from "@jollytoad/store-common/types";

/**
 * Additional functions for a store that is backed by `Deno.Kv`
 */
export interface ExposeDenoKv {
  /**
   * Get the underlying `Deno.Kv` connection of the store.
   *
   * @param key supply the common prefix for any ops you wish to perform
   */
  getDenoKv(key: StorageKey): Promise<Deno.Kv>;
}
