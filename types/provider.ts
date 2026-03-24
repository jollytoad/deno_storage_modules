/**
 * This module of types is for use by storage provider implementations.
 * @module
 */

import type {
  BatchableFnName,
  BatchOptions,
  StorageModule,
} from "./consumer.ts";

/**
 * The interface for a Storage provider module
 */
export type StorageProvider = Readonly<
  & Pick<StorageModule, RequiredFnNames>
  & Partial<Omit<StorageModule, RequiredFnNames>>
  & Partial<CommitProvider>
>;

/**
 * The function names that a Storage provider must implement
 */
export type RequiredFnNames = "url";

/**
 * The set of functions that a Storage provider must implement
 */
export type RequiredFns = Pick<StorageModule, RequiredFnNames>;

/**
 * The set of functions that a Storage provider may optionally implement
 */
export type OptionalFns = Omit<StorageModule, RequiredFnNames>;

/**
 * Additional interface to allow a Storage provider to implement its own
 * batch commit behaviour.
 */
export interface CommitProvider {
  /**
   * Commit the batch of buffered operations, as appropriate for the underlying
   * storage mechanism.
   */
  commit(
    ops: Iterable<BatchedOperation>,
    options?: BatchOptions,
  ): AsyncIterable<void>;
}

/**
 * A representation of an operation within a batch.
 */
export type BatchedOperation<
  FnName extends BatchableFnName = BatchableFnName,
> = [
  FnName,
  ...Parameters<Pick<StorageModule, FnName>[FnName]>,
];
