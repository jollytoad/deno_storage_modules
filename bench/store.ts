import type { StorageProvider } from "@storage/types";
import { benchSetItem } from "./set-item.ts";
import { benchGetItem } from "./get-item.ts";
import { benchHasItem } from "./has-item.ts";
import { benchGetItems } from "./get-items.ts";
import { benchList } from "./list.ts";
import { benchRemoveItem } from "./remove-item.ts";
import { benchClearItems } from "./clear-items.ts";
import { benchCopyItems } from "./copy-items.ts";
import { benchMoveItems } from "./move-items.ts";
import { benchBatch } from "./batch.ts";

/**
 * Configuration for {@linkcode benchStore}
 */
export interface BenchStoreOptions {
  /** A name prefix for each benchmark (e.g. provider name) */
  name?: string;
  /** Number of items to use per benchmark sample (default: 100) */
  iterations?: number;
  /** Is the store expected to be readonly? */
  readonly?: boolean;
}

/**
 * Register `Deno.bench` benchmarks for all storage operations
 * on a `StorageProvider` via the `@storage/fns` functions.
 */
export function benchStore(
  store: StorageProvider,
  options?: BenchStoreOptions,
): void {
  const { name = "", iterations = 100, readonly } = options ?? {};

  if (!readonly) {
    benchSetItem(store, name, iterations);
    benchRemoveItem(store, name, iterations);
    benchClearItems(store, name, iterations);
    benchCopyItems(store, name, iterations);
    benchMoveItems(store, name, iterations);
    benchBatch(store, name, iterations);
  }

  benchGetItem(store, name, iterations);
  benchHasItem(store, name, iterations);
  benchGetItems(store, name, iterations);
  benchList(store, name, iterations);
}
