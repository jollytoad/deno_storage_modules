import {
  dirname,
  relative,
  resolve,
  SEP_PATTERN,
} from "https://deno.land/std@0.182.0/path/mod.ts";
import { ensureDir } from "https://deno.land/std@0.182.0/fs/ensure_dir.ts";
import { exists } from "https://deno.land/std@0.182.0/fs/exists.ts";
import { walk } from "https://deno.land/std@0.182.0/fs/walk.ts";

export async function isWritable(key: string[] = []): Promise<boolean> {
  if (Deno.env.get("DENO_DEPLOYMENT_ID")) {
    return false;
  }
  return (await Deno.permissions.query({
    name: "write",
    path: dirpath(key),
  })).state === "granted";
}

export function hasItem(key: string[]): Promise<boolean> {
  return exists(filepath(key), { isFile: true });
}

export async function getItem<T>(key: string[]): Promise<T | undefined> {
  try {
    return JSON.parse(await Deno.readTextFile(filepath(key)));
  } catch (e) {
    if (e.code === "ENOENT") {
      return undefined;
    } else {
      throw e;
    }
  }
}

export async function setItem<T>(key: string[], value: T): Promise<void> {
  const path = filepath(key);
  await ensureDir(dirname(path));
  await Deno.writeTextFile(path, JSON.stringify(value));
}

export async function removeItem(key: string[]): Promise<void> {
  const path = filepath(key);
  if (await exists(path, { isFile: true })) {
    await Deno.remove(path);
  }
}

export async function* listItems<T>(
  keyPrefix: string[] = [],
): AsyncIterable<[string[], T]> {
  const root = dirpath();
  const path = dirpath(keyPrefix);

  try {
    for await (const entry of walk(path)) {
      if (entry.isFile && entry.name.endsWith(".json")) {
        const key = relative(root, entry.path.slice(0, -5)).split(
          SEP_PATTERN,
        );
        const item = await getItem<T>(key);
        if (item) {
          yield [key, item];
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

export function close() {
  return Promise.resolve();
}

function filepath(key: string[]) {
  return dirpath(key) + ".json";
}

function dirpath(key: string[] = []) {
  const root = Deno.env.get("STORE_FS_ROOT") ?? ".store";
  return resolve(root, ...key);
}
