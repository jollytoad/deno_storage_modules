/**
 * This module provides the {@linkcode getDenoKv} function, to aid
 * obtaining of `Deno.Kv` from any storage module if it's available.
 *
 * @module
 */
import type { DelegatingStore, StorageKey } from "@storage/types";
import type { ExposeDenoKv } from "./types.ts";

/**
 * Utility to attempt to get the underlying `Deno.Kv` if the store is backed by it.
 *
 * @example
 * ```ts
 * import { getDenoKv } from "jsr:@storage/deno-kv/get-deno-kv";
 * import * as store from "jsr:@storage/main";
 *
 * // Set the delegate store, try changing this to "jsr:@storage/deno-fs"
 * store.setStore(import("jsr:@storage/deno-kv"));
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
  store: Partial<ExposeDenoKv> & Partial<DelegatingStore>,
  key: StorageKey,
): Promise<Deno.Kv | undefined> {
  if ("getDenoKv" in store && typeof store.getDenoKv === "function") {
    return (store.getDenoKv)(key);
  } else if (
    "getDelegated" in store && typeof store.getDelegated === "function"
  ) {
    return getDenoKv(await store.getDelegated(key).store, key);
  }
}
