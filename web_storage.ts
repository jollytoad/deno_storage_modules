const SEP = "/";

export function isWritable(_key?: string[]): Promise<boolean> {
  return Promise.resolve(true);
}

export function getItem<T>(key: string[]): Promise<T | undefined> {
  const json = localStorage.getItem(storageKey(key));
  if (typeof json === "string") {
    return Promise.resolve(JSON.parse(json));
  }
  return Promise.resolve(undefined);
}

export function setItem<T>(key: string[], value: T): Promise<void> {
  localStorage.setItem(storageKey(key), JSON.stringify(value));
  return Promise.resolve();
}

export function removeItem(key: string[]): Promise<void> {
  localStorage.removeItem(storageKey(key));
  return Promise.resolve();
}

export async function* listItems<T>(
  keyPrefix: string[] = [],
): AsyncIterable<[string[], T]> {
  const prefix = keyPrefix.length ? storageKey(keyPrefix) + SEP : "";
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(prefix)) {
      const json = localStorage.getItem(key);
      if (json) {
        try {
          yield [key.split(SEP), JSON.parse(json)];
        } catch (e) {
          console.error(e);
        }
      }
    }
  }
}

function storageKey(key: string[]) {
  return key.join(SEP);
}
