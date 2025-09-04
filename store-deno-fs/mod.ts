import { dirname } from "@std/path/dirname";
import { relative } from "@std/path/relative";
import { resolve } from "@std/path/resolve";
import { SEPARATOR_PATTERN } from "@std/path/constants";
import { ensureDir } from "@std/fs/ensure-dir";
import { emptyDir } from "@std/fs/empty-dir";
import { exists } from "@std/fs/exists";
import { walk } from "@std/fs/walk";
import { copy } from "@std/fs/copy";
import { move } from "@std/fs/move";
import type {
  CompleteStorageModule,
  StorageKey,
  StorageModule,
} from "@jollytoad/store-common/types";
import { fromStrKey, toStrKey } from "@jollytoad/store-common/key-utils";

export type { StorageKey, StorageModule };

({
  isWritable,
  hasItem,
  getItem,
  setItem,
  removeItem,
  listItems,
  clearItems,
  copyItems,
  moveItems,
  close,
  url,
}) satisfies CompleteStorageModule;

/**
 * Returns the `import.meta.url` of the module.
 */
export function url(): Promise<string> {
  return Promise.resolve(import.meta.url);
}

/**
 * Check for filesystem write permission at directory for the given key.
 */
export async function isWritable(key: StorageKey = []): Promise<boolean> {
  if (Deno.env.get("DENO_DEPLOYMENT_ID")) {
    return false;
  }
  return (await Deno.permissions.query({
    name: "write",
    path: dirpath(key),
  })).state === "granted";
}

/**
 * Determine whether a value is set for the given key.
 */
export function hasItem(key: StorageKey): Promise<boolean> {
  return exists(filepath(key), { isFile: true });
}

/**
 * Get a value for the given key.
 */
export async function getItem<T>(key: StorageKey): Promise<T | undefined> {
  try {
    return JSON.parse(await Deno.readTextFile(filepath(key)));
  } catch (e) {
    if (isNotFound(e)) {
      return undefined;
    } else {
      throw e;
    }
  }
}

/**
 * Set a value for the given key.
 */
export async function setItem<T>(key: StorageKey, value: T): Promise<void> {
  const path = filepath(key);
  await ensureDir(dirname(path));
  await Deno.writeTextFile(path, JSON.stringify(value));
}

/**
 * Remove the value with the given key.
 */
export async function removeItem(key: StorageKey): Promise<void> {
  let path = filepath(key);
  if (await exists(path, { isFile: true })) {
    await Deno.remove(path);

    const root = dirpath();
    path = dirname(path);
    while (path !== root) {
      try {
        await Deno.remove(path);
      } catch {
        break;
      }
      path = resolve(path, "..");
    }
  }
}

/**
 * List all items beneath the given key prefix.
 * At present ordering is not guaranteed and reverse support is optional.
 */
export async function* listItems<T>(
  keyPrefix: StorageKey = [],
  _reverse = false,
): AsyncIterable<[StorageKey, T]> {
  const root = dirpath();
  const path = dirpath(keyPrefix);

  try {
    for await (const entry of walk(path)) {
      if (entry.isFile && entry.name.endsWith(".json")) {
        const key = relative(root, entry.path.slice(0, -5)).split(
          SEPARATOR_PATTERN,
        );
        const item = await getItem<T>(key);
        if (item !== undefined) {
          yield [fromStrKey(key), item];
        }
      }
    }
  } catch (e) {
    if (isNotFound(e)) {
      return;
    } else {
      throw e;
    }
  }
}

/**
 * Delete item and sub items recursively and clean up.
 */
export async function clearItems(keyPrefix: StorageKey): Promise<void> {
  await removeItem(keyPrefix);
  try {
    await Deno.remove(dirpath(keyPrefix), { recursive: true });
  } catch (e) {
    if (isNotFound(e)) {
      return;
    } else {
      throw e;
    }
  }
}

/**
 * Copy an item and all sub items to a new key.
 */
export async function copyItems<T>(
  fromPrefix: StorageKey,
  toPrefix: StorageKey,
): Promise<void> {
  await copy(filepath(fromPrefix), filepath(toPrefix), { overwrite: true });
  await emptyDir(dirpath(toPrefix));
  await copy(dirpath(fromPrefix), dirpath(toPrefix), { overwrite: true });
}

/**
 * Move an item and all sub items to a new key.
 */
export async function moveItems<T>(
  fromPrefix: StorageKey,
  toPrefix: StorageKey,
): Promise<void> {
  await move(filepath(fromPrefix), filepath(toPrefix), { overwrite: true });
  await move(dirpath(fromPrefix), dirpath(toPrefix), { overwrite: true });
}

/**
 * Close all associated resources.
 * This isn't generally required in most situations, it's main use is within test cases.
 */
export function close(): Promise<void> {
  return Promise.resolve();
}

function filepath(key: StorageKey) {
  return dirpath(key) + ".json";
}

function dirpath(key: StorageKey = []) {
  const root = Deno.env.get("STORE_FS_ROOT") ?? ".store";
  return resolve(root, ...toStrKey(key));
}

// deno-lint-ignore no-explicit-any
function isNotFound(e: any) {
  return e && "code" in e && e.code === "ENOENT";
}
