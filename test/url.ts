import type { DelegatedStore, StorageProvider } from "@storage/types";
import { assertStringIncludes } from "@std/assert/string-includes";

/**
 * Test the {@linkcode url} function of the given storage module.
 */
export async function testUrl(
  t: Deno.TestContext,
  { url }: StorageProvider,
  includes: string,
) {
  await t.step(`url contains "${includes}"`, async () => {
    const actualUrl = await url();
    console.debug("StorageProvider URL:", actualUrl);
    assertStringIncludes(actualUrl, includes);
  });
}

/**
 * Test the {@linkcode url} function of the given delegated storage module
 * with a key prefix.
 */
export async function testUrlForPrefix(
  t: Deno.TestContext,
  { url }: DelegatedStore,
  includes: string,
  prefix: string,
) {
  await t.step(
    `url contains "${includes}" for keys prefixed with "${prefix}"`,
    async () => {
      const actualUrl = await url(prefix);
      console.debug(`StorageProvider (${prefix}) URL:`, actualUrl);
      assertStringIncludes(actualUrl, includes);
    },
  );
}
