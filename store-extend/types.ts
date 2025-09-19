import type { StorageModule } from "@jollytoad/store-common/types";

/**
 * Defines the set of extension functions to pass to `extendStore`.
 *
 * All functions are optional and match those in the store but with the
 * addition of `this` declared as the original store.
 *
 * @param TOriginalStore the shape of storage module that we are extending from
 * @param TExtendedStore the shape of the extended storage module
 */
export type StoreTrait<
  TOriginalStore extends StorageModule = StorageModule,
  TExtendedStore extends TOriginalStore = TOriginalStore,
> = {
  [TKey in keyof TExtendedStore]?: TExtendedStore[TKey] extends
    (...args: infer TArgs) => infer TReturn
    ? (this: TOriginalStore, ...args: TArgs) => TReturn
    : never;
};
