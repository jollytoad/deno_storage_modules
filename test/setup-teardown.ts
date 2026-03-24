import type { StorageKey, StorageProvider } from "@storage/types";
import { hasItem } from "@storage/fns/has-item";
import { clearItems } from "@storage/fns/clear-items";
import { close } from "@storage/fns/close";
import { TEST_PREFIX } from "./fixtures.ts";

/**
 * Ensure that the underlying storage has been opened and is empty
 */
export async function setup(
  _t: Deno.TestContext,
  store: StorageProvider,
  prefix: StorageKey = TEST_PREFIX,
) {
  await hasItem(store, prefix);
  await clearItems(store, prefix);
}

/**
 * Clear and close the store after tests complete
 */
export async function teardown(
  _t: Deno.TestContext,
  store: StorageProvider,
  prefix: StorageKey = TEST_PREFIX,
) {
  try {
    await clearItems(store, prefix);
  } finally {
    await close(store);
  }
}
