import type { StorageModule } from "@jollytoad/store-common/types";
import type { StoreTrait } from "./types.ts";

/**
 * Extend the behaviour of an existing store with a store trait.
 *
 * Any `StorageModule` function can be overridden in the trait,
 * with `this` being the original storage module.
 *
 * @param store the storage module to extend from
 * @param trait the functions of the module to override, these
 *   function may access the original storage module via `this`
 * @returns the new extended storage module
 *
 * @example
 * ```ts
 * import * as originalStore from "@jollytoad/store-deno-fs";
 * import { extendStore } from "@jollytoad/store-extend";
 *
 * const store = extendStore(originalStore, {
 *   setItem(key, value) {
 *     console.debug(`Saving: ${key.join("/")}`);
 *     return this.setItem(key, value);
 *   }
 * });
 *
 * await store.setItem(["foo", "bah"], "stuff");
 * ```
 *
 * This example will cause a message to be logged to the console
 * on every call to `setItem`.
 */
export function extendStore<
  TOriginalStore extends StorageModule = StorageModule,
  TExtendedStore extends TOriginalStore = TOriginalStore,
>(
  store: TOriginalStore,
  trait: StoreTrait<TOriginalStore, TExtendedStore>,
): TExtendedStore {
  type TKey = keyof TExtendedStore;
  return new Proxy(store, {
    get(target, prop, receiver) {
      if (
        typeof prop === "string" && typeof trait[prop as TKey] === "function"
      ) {
        return (...args: unknown[]) => trait[prop as TKey]?.apply(target, args);
      } else {
        return Reflect.get(target, prop, receiver);
      }
    },
  }) as TExtendedStore;
}
