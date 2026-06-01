import type {
  BatchedFn,
  BatchOptions,
  DelegatingStore,
  StorageKey,
  StorageModule,
  StorageProvider,
} from "@storage/types";
import { batch as commonBatch } from "@storage/fns/batch";
import * as provider from "./provider.ts";
import * as delegate from "./delegate.ts";

export type { DelegatingStore, StorageKey, StorageModule };

({
  ...provider,
  ...delegate,
  batch,
}) satisfies StorageModule & StorageProvider & DelegatingStore;

export * from "./provider.ts";
export * from "./delegate.ts";

/**
 * Start batching operations within the given callback fn.
 */
export function batch<T>(
  fn: BatchedFn<T>,
  options?: BatchOptions,
): Promise<T> {
  return commonBatch<T>(provider, fn, options);
}
