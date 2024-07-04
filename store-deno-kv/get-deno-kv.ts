import type {
  DelegatedStore,
  StorageKey,
  StorageModule,
} from "@jollytoad/store-common/types";
import type { ExposeDenoKv } from "./types.ts";

/**
 * Utility to attempt to get the underlying `Deno.Kv` if the store is backed by it.
 *
 * @example
 * ```ts
 * import { getDenoKv } from "jsr:@jollytoad/store-deno-kv/get-deno-kv";
 * import * as store from "jsr:@jollytoad/store";
 *
 * const kv = await getDenoKv(store, ["foo"]);
 *
 * const key = ["foo", "counter"];
 *
 * if (kv) {
 *   // we can do an atomic increment...
 *   kv.atomic()
 *     .mutate({ type: "sum", key, value: new Deno.KvU64(1n) })
 *     .commit();
 * } else {
 *   // otherwise fallback to a risky, get and set...
 *   await store.setItem(key, (await store.getItem<number>(key) ?? 0) + 1);
 * }
 * ```
 */
export async function getDenoKv(
  store: StorageModule & Partial<ExposeDenoKv> & Partial<DelegatedStore>,
  key: StorageKey,
): Promise<Deno.Kv | undefined> {
  if ("getDenoKv" in store && typeof store.getDenoKv === "function") {
    return (store.getDenoKv)(key);
  } else if ("getStore" in store && typeof store.getStore === "function") {
    return getDenoKv(await store.getStore(), key);
  }
}
