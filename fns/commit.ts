import { pooledMap } from "@std/async/pool";
import type {
  BatchedOperation,
  BatchOptions,
  StorageProvider,
} from "@storage/types";

/**
 * Default concurrency level of operations during a commit.
 */
export const DEFAULT_CONCURRENCY = 100;

/**
 * A default `commit`, for stores that don't explicitly support batching.
 *
 * This will apply operations gathered within the batch using the
 * original store functions, performed concurrently upto the maximum
 * concurrency level given in the options.
 */
export function commit(
  store: StorageProvider,
  ops: Iterable<BatchedOperation>,
  options?: BatchOptions,
): AsyncIterable<void> {
  if (store.commit) {
    return store.commit(ops, options);
  } else {
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
}
