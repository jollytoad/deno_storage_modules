import type { BatchOptions, StorageProvider } from "@storage/types";
import { setup, teardown } from "./setup-teardown.ts";
import { testBatch } from "./batch.ts";
import { testClearItems } from "./clear-items.ts";
import { testCopyItems } from "./copy-items.ts";
import { testGetItem } from "./get-item.ts";
import { testHasItem } from "./has-item.ts";
import { testIsWritable } from "./is-writable.ts";
import { testListItems } from "./list.ts";
import { testMoveItems } from "./move-items.ts";
import { testOrdering } from "./ordering.ts";
import { testRemoveItem } from "./remove-item.ts";
import { testSetItem } from "./set-item.ts";
import { testUrl } from "./url.ts";
import { testGetItems } from "./get-items.ts";

/**
 * Configuration for {@linkcode testStore}
 */
export interface TestStoreOptions {
  /**
   * An expected substring of the store's URL
   */
  urlIncludes?: string;

  /**
   * Is the store expected to be readonly?
   */
  readonly?: boolean;

  /**
   * The store is expected to support ordering by key from listItems
   */
  orderedByKey?: boolean;

  /**
   * The atomic options to test for batch testing
   */
  batchAtomic?: BatchOptions["atomic"][];

  /**
   * Additional tests to run before teardown
   */
  extraTests?:
    ((t: Deno.TestContext, store: StorageProvider) => Promise<void>)[];
}

/**
 * Test all storage functions on a `StorageProvide`,
 * including setup, url, isWritable, all operations,
 * support for ordering, batch tests and teardown
 */
export async function testStore(
  t: Deno.TestContext,
  store: StorageProvider,
  options?: TestStoreOptions,
) {
  const { urlIncludes: url, readonly, orderedByKey, extraTests } = options ??
    {};

  try {
    await setup(t, store);

    if (url) {
      await testUrl(t, store, url);
    }

    await testIsWritable(t, store, !readonly);

    await testOperations(t, store);

    if (orderedByKey) {
      await testOrdering(t, store);
    }

    for (const atomic of options?.batchAtomic ?? [undefined]) {
      await testBatch(t, store, { atomic });
    }

    if (extraTests) {
      for (const test of extraTests) {
        await test(t, store);
      }
    }
  } finally {
    await teardown(t, store);
  }
}

/**
 * Test all storage read/write operations on a `StorageProvide`.
 */
export async function testOperations(
  t: Deno.TestContext,
  store: StorageProvider,
) {
  await testSetItem(t, store);
  await testHasItem(t, store);
  await testGetItem(t, store);
  await testGetItems(t, store);
  await testListItems(t, store);
  await testRemoveItem(t, store);
  await testClearItems(t, store);
  await testCopyItems(t, store);
  await testMoveItems(t, store);
}
