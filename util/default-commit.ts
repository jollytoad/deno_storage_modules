import { pooledMap } from "@std/async/pool";
import type {
  BatchableFnName,
  BatchedOperation,
  BatchOptions,
  StorageProvider,
} from "@storage/types";

/**
 * Default concurrency level of operations during a commit.
 */
export const DEFAULT_CONCURRENCY = 10;

/**
 * A default `commit`, for stores that don't explicitly support batching.
 *
 * This will apply operations gathered within the batch using the
 * original store functions, performed concurrently upto the maximum
 * concurrency level given in the options.
 */
export function defaultCommit(
  store: Pick<StorageProvider, BatchableFnName>,
  ops: Iterable<BatchedOperation>,
  options?: BatchOptions,
): AsyncIterable<void> {
  return pooledMap(options?.concurrency ?? DEFAULT_CONCURRENCY, ops, (op) => {
    const [fnName, ...args] = op;
    const fn = store[fnName];
    if (fn) {
      // deno-lint-ignore no-explicit-any
      return fn.apply(store, args as any);
    } else {
      // TODO: better error
      return Promise.reject(new TypeError(`Unknown operation '${fnName}'`));
    }
  });
}
