import type { StorageProvider } from "@storage/types";
import { clearItems } from "@storage/fns/clear-items";
import { close } from "@storage/fns/close";

/**
 * Ensure the underlying storage has been opened and is empty
 */
export async function setup(store: StorageProvider): Promise<void> {
  await clearItems(store, []);
}

/**
 * Clear and close the store after benchmarks complete
 */
export async function teardown(store: StorageProvider): Promise<void> {
  try {
    await clearItems(store, []);
  } finally {
    await close(store);
  }
}
