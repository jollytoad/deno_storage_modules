import { StorageKey } from "./types.ts";

/**
 * Convert a {@linkcode StorageKey} to an array of strings
 */
export function toStrKey(key: StorageKey = []): string[] {
  return key.map((k) =>
    typeof k === "string"
      ? k
      : Number.isSafeInteger(k)
      ? `${k}`.padStart(16, "0")
      : `${k}`
  );
}

/**
 * Convert an array of strings to a {@linkcode StorageKey}
 */
export function fromStrKey(strKey: string[]): StorageKey {
  return strKey.map((k) => {
    if (k === "true") return true;
    if (k === "false") return false;
    if (/^\d+$/.test(k)) {
      const n = Number.parseInt(k);
      if (Number.isSafeInteger(n)) return n;
    }
    return k;
  });
}
