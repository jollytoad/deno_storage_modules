import type { StorageProvider } from "@storage/types";

({
  url,
}) satisfies StorageProvider;

/**
 * Returns the `import.meta.url` of the module.
 */
export function url(): Promise<string> {
  return Promise.resolve(import.meta.url);
}
