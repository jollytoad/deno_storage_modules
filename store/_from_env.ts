import type { StorageModule } from "@jollytoad/store-common/types";

/**
 * Import the storage module declared in the `STORAGE_MODULE` environment variable.
 */
export function fromEnv(): Promise<StorageModule> {
  const moduleSpecifier = getEnv("STORAGE_MODULE");
  if (moduleSpecifier) {
    return import(import.meta.resolve(moduleSpecifier));
  } else {
    return Promise.reject(
      new Error(
        "A StorageModule was not selected, either via `setStore()`, or the `STORAGE_MODULE` env var",
      ),
    );
  }
}

type NodeGlobal = typeof globalThis & {
  process: { env: Record<string, string> };
};

function getEnv(name: string): string | undefined {
  return globalThis.Deno?.env?.get(name) ??
    (globalThis as NodeGlobal).process?.env?.[name];
}
