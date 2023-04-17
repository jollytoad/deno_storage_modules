import {
  dirname,
  relative,
  resolve,
  SEP_PATTERN,
} from "https://deno.land/std@0.182.0/path/mod.ts";
import { ensureDir } from "https://deno.land/std@0.182.0/fs/ensure_dir.ts";
import { exists } from "https://deno.land/std@0.182.0/fs/exists.ts";
import { walk } from "https://deno.land/std@0.182.0/fs/walk.ts";

export async function isWritable(namespace: string[] = []): Promise<boolean> {
  if (Deno.env.get("DENO_DEPLOYMENT_ID")) {
    return false;
  }
  return (await Deno.permissions.query({
    name: "write",
    path: dirpath(namespace),
  })).state === "granted";
}

export async function getItem<T>(namespace: string[]): Promise<T | undefined> {
  try {
    return JSON.parse(await Deno.readTextFile(filepath(namespace)));
  } catch (e) {
    if (e.code === "ENOENT") {
      return undefined;
    } else {
      throw e;
    }
  }
}

export async function setItem<T>(namespace: string[], value: T): Promise<void> {
  const path = filepath(namespace);
  await ensureDir(dirname(path));
  await Deno.writeTextFile(path, JSON.stringify(value));
}

export async function removeItem<T>(namespace: string[]): Promise<boolean> {
  const path = filepath(namespace);
  if (await exists(path, { isFile: true })) {
    await Deno.remove(path);
    return true;
  }
  return false;
}

export async function* listItems<T>(
  namespacePrefix: string[] = [],
): AsyncIterable<[string[], T]> {
  const root = dirpath();
  const path = dirpath(namespacePrefix);

  try {
    for await (const entry of walk(path)) {
      if (entry.isFile && entry.name.endsWith(".json")) {
        const namespace = relative(root, entry.path.slice(0, -5)).split(
          SEP_PATTERN,
        );
        const item = await getItem<T>(namespace);
        if (item) {
          yield [namespace, item];
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

function filepath(namespace: string[]) {
  return dirpath(namespace) + ".json";
}

function dirpath(namespace: string[] = []) {
  const root = Deno.env.get("STORE_ROOT") ?? ".store";
  return resolve(root, ...namespace);
}
