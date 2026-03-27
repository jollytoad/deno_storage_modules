import type {
  BatchedFn,
  BatchedOperation,
  BatchOptions,
  StorageKey,
  StorageProvider,
} from "@storage/types";
import {
  type AsyncContextVariable,
  createAsyncContextVariable,
} from "./_async_context.ts";

type BatchState = {
  ops: Map<StorageKey, BatchedOperation>;
  inCommit: boolean;
};

let context: AsyncContextVariable<BatchState> | undefined;

function abort(): Promise<void> {
  const ops = context?.get()?.ops;
  if (ops?.size) {
    ops.clear();
  }
  return Promise.resolve();
}

/**
 * Batch write operations called within the given callback.
 *
 * The passed function is called immediately, and all
 * {@linkcode BatchableOperations} are buffered under the function returns,
 * or `commit`/`abort` is explicitly called.
 *
 * If the `store` provides a `commit` function it will be called with the
 * buffered operations to perform the actual commit of operations, otherwise
 * a default `commit` will be performed, that applies the operations
 * concurrently using the regular store fns.
 *
 * The {@linkcode BatchControl} functions passed in can be used to explicitly
 * `commit` or `abort` the operations buffered so far.
 *
 * @param store The store on which to batch operations
 * @param fn To be immediately called with an open batch scope
 * @param options Specify the behaviour of the batch/commit.
 */
export async function batch<T>(
  store: StorageProvider,
  fn: BatchedFn<T>,
  options?: BatchOptions,
): Promise<T> {
  context ??= await createAsyncContextVariable();

  async function commit() {
    const state = context?.get();
    if (state?.ops?.size) {
      try {
        state.inCommit = true;

        const result = store.commit
          ? store.commit(state.ops.values(), options)
          : (await import("@storage/util/default-commit")).defaultCommit(
            store,
            state.ops.values(),
            options,
          );

        for await (const _ of result) {
          // do nothing
        }
      } finally {
        state.ops.clear();
        state.inCommit = false;
      }
    }
  }

  if (context?.get()) {
    // already in a transaction, so just add to current tx
    return await fn({ commit, abort });
  } else {
    return context.run({ ops: new Map(), inCommit: false }, async () => {
      const result = await fn({ commit, abort });

      await commit();

      return result;
    });
  }
}

/**
 * Check if we are currently inside a batch scope.
 */
export function inBatch(): boolean {
  const state = context?.get();
  return !!state && !state.inCommit;
}

/**
 * Check if we are currently performing the commit phase of a batch.
 */
export function inCommit(): boolean {
  return !!context?.get()?.inCommit;
}

/**
 * Add an operation to the current batch.
 *
 * @param op the operation
 */
export function addOp(op: BatchedOperation): void {
  context?.get()?.ops.set(op[1], op);
}
