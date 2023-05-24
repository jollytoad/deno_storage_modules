import { StorageKey } from "./types.ts";

export function toStrKey(key: StorageKey = []): string[] {
  return key.map((k) =>
    typeof k === "string"
      ? k
      : Number.isSafeInteger(k)
      ? `${k}`.padStart(16, "0")
      : `${k}`
  );
}

export function fromStrKey(strKey: string[]): StorageKey {
  return strKey.map((k) => {
    if (k === "true") return true;
    if (k === "false") return false;
    const n = Number.parseInt(k);
    if (Number.isSafeInteger(n)) return n;
    return k;
  });
}
