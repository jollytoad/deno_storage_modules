import type { StorageKey, StorageProvider } from "@storage/types";
import { isWritable } from "@storage/fns/is-writable";
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
export async function benchStore(
  store: StorageProvider,
): Promise<void> {
  const items = createTestItems(PREFIX);

  if (await isWritable(store)) {
    await benchSetItem(store, items);
    await benchRemoveItem(store, items);
    await benchClearItems(store, items);
    await benchCopyItems(store, items);
    await benchMoveItems(store, items);
    await benchBatch(store, items);
  }

  await benchGetItem(store, items);
  await benchHasItem(store, items);
  await benchGetItems(store, items);
  await benchList(store, items);
}
