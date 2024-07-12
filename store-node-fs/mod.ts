/// <reference types="@types/node/fs/promises" />

import type { StorageKey, StorageModule } from "@jollytoad/store-common/types";
import { fromStrKey, toStrKey } from "@jollytoad/store-common/key-utils";

import * as fs from "node:fs/promises";
import { dirname, join, relative, resolve, sep } from "node:path";
import * as process from "node:process";

export type { StorageKey, StorageModule };

({
  isWritable,
  hasItem,
  getItem,
  setItem,
  removeItem,
  listItems,
  clearItems,
  close,
  url,
}) satisfies StorageModule;

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
  let path = dirpath(key);
  const rootParent = dirname(dirpath());
  do {
    if (await exists(path)) {
      return await canWrite(path);
    }
    if (path === rootParent) {
      break;
    }
    path = dirname(path);
  } while (path);
  return false;
}

async function canWrite(path: string): Promise<boolean> {
  try {
    await fs.access(path, fs.constants.W_OK);
    return true;
  } catch {
    return false;
  }
}

async function exists(path: string): Promise<boolean> {
  try {
    return !!(await fs.stat(path));
  } catch {
    return false;
  }
}

/**
 * Determine whether a value is set for the given key.
 */
export async function hasItem(key: StorageKey): Promise<boolean> {
  try {
    return (await fs.stat(filepath(key))).isFile();
  } catch {
    return false;
  }
}

/**
 * Get a value for the given key.
 */
export async function getItem<T>(key: StorageKey): Promise<T | undefined> {
  try {
    return JSON.parse(await fs.readFile(filepath(key), { encoding: "utf-8" }));
  } catch (e) {
    if (e.code === "ENOENT") {
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
  await fs.mkdir(dirname(path), { recursive: true });
  await fs.writeFile(path, JSON.stringify(value), { encoding: "utf-8" });
}

/**
 * Remove the value with the given key.
 */
export async function removeItem(key: StorageKey): Promise<void> {
  let path = filepath(key);
  try {
    await fs.rm(path);

    const root = dirpath();
    path = dirname(path);
    while (path !== root) {
      try {
        await fs.rmdir(path);
      } catch {
        break;
      }
      path = resolve(path, "..");
    }
  } catch (e) {
    if (e.code !== "ENOENT") {
      throw e;
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
      if (entry.name.endsWith(".json")) {
        const key = relative(root, entry.path.slice(0, -5)).split(sep);
        const item = await getItem<T>(key);
        if (item) {
          yield [fromStrKey(key), item];
        }
      }
    }
  } catch (e) {
    if (e.code === "ENOENT") {
      return;
    } else {
      throw e;
    }
  }
}

async function* walk(
  root: string,
): AsyncIterable<{ name: string; path: string }> {
  for await (const entry of await fs.opendir(root)) {
    const path = join(root, entry.name);

    if (entry.isDirectory()) {
      yield* walk(path);
    } else if (entry.isFile()) {
      yield { path, name: entry.name };
    }
  }
}

/**
 * Delete item and sub items recursively and clean up.
 */
export async function clearItems(keyPrefix: StorageKey): Promise<void> {
  await removeItem(keyPrefix);
  try {
    await fs.rmdir(dirpath(keyPrefix), { recursive: true });
  } catch (e) {
    if (e.code === "ENOENT") {
      return;
    } else {
      throw e;
    }
  }
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
  const root = process.env.STORE_FS_ROOT ?? ".store";
  return resolve(root, ...toStrKey(key));
}
