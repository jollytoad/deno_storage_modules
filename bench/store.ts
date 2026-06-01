import type { StorageKey, StorageProvider } from "@storage/types";
import { createTestItems } from "./fixtures.ts";
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

const PREFIX: StorageKey = ["bench"];

/**
 * Register `Deno.bench` benchmarks for all storage operations
 * on a `StorageProvider` via the `@storage/fns` functions.
 */
export function benchStore(
  store: StorageProvider,
): void {
  const items = createTestItems(PREFIX);

  benchSetItem(store, items);
  benchRemoveItem(store, items);
  benchClearItems(store, items);
  benchCopyItems(store, items);
  benchMoveItems(store, items);
  benchBatch(store, items);

  benchGetItem(store, items);
  benchHasItem(store, items);
  benchGetItems(store, items);
  benchList(store, items);
}
