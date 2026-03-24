import type { StorageProvider } from "@storage/types";
import { assertEquals } from "@std/assert/equals";
import { isWritable } from "@storage/fns/is-writable";

/**
 * Test the {@linkcode isWritable} function of the given storage module.
 */
export async function testIsWritable(
  t: Deno.TestContext,
  store: StorageProvider,
  expected = true,
  prefix?: string,
) {
  await t.step({
    name: `isWritable(${prefix ? `["${prefix}"]` : ""}) to be ${expected}`,
    fn: async () => {
      assertEquals(
        await isWritable(store, prefix ? [prefix] : undefined),
        expected,
      );
    },
  });
}
