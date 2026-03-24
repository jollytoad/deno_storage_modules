/**
 * Minimal AsyncContext.Variable type
 *
 * @see https://github.com/tc39/proposal-async-context
 * @see https://nodejs.org/api/async_context.html
 */
export interface AsyncContextVariable<T> {
  /**
   * Get the value of the variable within the current async context
   */
  get(): T | undefined;

  /**
   * Set the value of the variable within execution of the given fn
   */
  run<R>(value: T, fn: () => R): R;
}

/**
 * Create a minimal async context variable using the most appropriate
 * available API.
 *
 * Currently just uses the node `AsyncLocalStorage`, but may in the future
 * also support `AsyncContext.Variable`.
 */
export async function createAsyncContextVariable<T>(): Promise<
  AsyncContextVariable<T>
> {
  const context = new (await import("node:async_hooks")).AsyncLocalStorage<T>();
  return {
    get: () => context.getStore(),
    run: (value, fn) => context.run(value, fn),
  };
}
