import type {
  BatchedFn,
  BatchedOperation,
  BatchOptions,
  DelegatedStore,
  StorageKey,
  StorageModule,
  StorageProvider,
} from "@storage/types";
import { batch as commonBatch } from "@storage/fns/batch";
import { commit as commonCommit } from "@storage/fns/commit";
import * as provider from "./provider.ts";
import * as delegate from "./delegate.ts";

export type { DelegatedStore, StorageKey, StorageModule };

({
  ...provider,
  ...delegate,
  batch,
  commit,
}) satisfies StorageModule & StorageProvider & DelegatedStore;

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

/**
 * Commit the current batch.
 */
export function commit(
  ops: Iterable<BatchedOperation>,
  options?: BatchOptions,
): AsyncIterable<void> {
  return commonCommit(provider, ops, options);
}
