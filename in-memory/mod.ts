import type {
  ListItemsOptions,
  SetItemOptions,
  StorageKey,
  StorageProvider,
} from "@storage/types";

({
  isWritable,
  hasItem,
  getItem,
  setItem,
  removeItem,
  listItems,
  listKeys,
  listValues,
  close,
  url,
}) satisfies StorageProvider;

interface Node {
  value?: unknown;
  children?: Map<string | number | boolean, Node>;
  expiryTimer?: ReturnType<typeof setTimeout>;
}

const root: Node = {};
const activeTimers = new Set<ReturnType<typeof setTimeout>>();

/**
 * Returns the `import.meta.url` of the module.
 */
export function url(): Promise<string> {
  return Promise.resolve(import.meta.url);
}

/**
 * Check whether the storage is writable in general, or at or below a particular key.
 */
export function isWritable(_key?: StorageKey): Promise<boolean> {
  return Promise.resolve(true);
}

/**
 * Determine whether a value is set for the given key.
 */
export function hasItem(key: StorageKey): Promise<boolean> {
  return Promise.resolve(getNode(key)?.value !== undefined);
}

/**
 * Get a value for the given key.
 */
export function getItem<T>(key: StorageKey): Promise<T | undefined> {
  return Promise.resolve(getNode(key)?.value as T | undefined);
}

/**
 * Set a value for the given key.
 * Supports the `expireIn` option, using `setTimeout` for expiry.
 */
export function setItem<T>(
  key: StorageKey,
  value: T,
  options?: SetItemOptions,
): Promise<void> {
  let node = root;
  for (const segment of key) {
    node.children ??= new Map();
    node = node.children.getOrInsertComputed(segment, () => ({}));
  }
  node.value = value;

  if (options?.expireIn) {
    clearTimer(node);
    const timer = setTimeout(() => {
      node.value = undefined;
      activeTimers.delete(timer);
    }, options.expireIn);
    node.expiryTimer = timer;
    activeTimers.add(timer);
  }

  return Promise.resolve();
}

/**
 * Remove the value with the given key.
 */
export function removeItem(key: StorageKey): Promise<void> {
  let node = root;
  const path: { node: Node; segment: string | number | boolean }[] = [];
  for (const segment of key) {
    const child = node.children?.get(segment);
    if (!child) return Promise.resolve();
    path.push({ node, segment });
    node = child;
  }

  clearTimer(node);
  node.value = undefined;

  while (path.length > 0) {
    const { node: parent, segment } = path.pop()!;
    const child = parent.children!.get(segment)!;
    if (child.value === undefined && !child.children?.size) {
      parent.children!.delete(segment);
    } else {
      break;
    }
  }

  return Promise.resolve();
}

type ListResult<T, M extends 0 | 1 | 2> = M extends 0 ? [StorageKey, T]
  : M extends 1 ? StorageKey
  : T;

async function* _list<T, M extends 0 | 1 | 2>(
  keyPrefix: StorageKey,
  mode: M,
  options?: ListItemsOptions,
): AsyncIterable<ListResult<T, M>> {
  const start = keyPrefix.length ? getNode(keyPrefix) : root;
  if (!start) return;
  const prefix = [...keyPrefix];
  const reverse = options?.reverse ?? false;
  const stack: { node: Node; key: StorageKey }[] = [
    { node: start, key: prefix },
  ];
  while (stack.length > 0) {
    const { node, key } = stack.pop()!;
    if (node.value !== undefined) {
      switch (mode) {
        case 0:
          yield [key, node.value as T] as ListResult<T, M>;
          break;
        case 1:
          yield key as ListResult<T, M>;
          break;
        case 2:
          yield node.value as ListResult<T, M>;
          break;
      }
    }
    if (node.children) {
      const entries = [...node.children.entries()].sort(([a], [b]) =>
        compareSegments(a, b)
      );
      const iter = reverse ? entries : entries.toReversed();
      for (const [segment, child] of iter) {
        stack.push({ node: child, key: [...key, segment] });
      }
    }
  }
}

/**
 * List all items beneath the given key prefix.
 */
export function listItems<T>(
  keyPrefix: StorageKey = [],
  options?: ListItemsOptions,
): AsyncIterable<[StorageKey, T]> {
  return _list<T, 0>(keyPrefix, 0, options);
}

/**
 * List all keys beneath the given key prefix.
 */
export function listKeys(
  keyPrefix: StorageKey = [],
  options?: ListItemsOptions,
): AsyncIterable<StorageKey> {
  return _list<unknown, 1>(keyPrefix, 1, options);
}

/**
 * List all values beneath the given key prefix.
 */
export function listValues<T>(
  keyPrefix: StorageKey = [],
  options?: ListItemsOptions,
): AsyncIterable<T> {
  return _list<T, 2>(keyPrefix, 2, options);
}

/**
 * Close the store, clearing all data and pending expiry timers.
 */
export function close(): Promise<void> {
  for (const timer of activeTimers) {
    clearTimeout(timer);
  }
  activeTimers.clear();
  root.value = undefined;
  root.children?.clear();
  return Promise.resolve();
}

function getNode(key: StorageKey): Node | undefined {
  let node: Node | undefined = root;
  for (const segment of key) {
    node = node.children?.get(segment);
    if (!node) return undefined;
  }
  return node;
}

function clearTimer(node: Node): void {
  if (node.expiryTimer !== undefined) {
    clearTimeout(node.expiryTimer);
    activeTimers.delete(node.expiryTimer);
    node.expiryTimer = undefined;
  }
}

function compareSegments(
  a: string | number | boolean,
  b: string | number | boolean,
): number {
  const typeOrder = { boolean: 0, number: 1, string: 2 };
  const ta = typeOrder[typeof a as keyof typeof typeOrder];
  const tb = typeOrder[typeof b as keyof typeof typeOrder];
  if (ta !== tb) return ta - tb;
  if (typeof a === "boolean") return a === b ? 0 : a ? 1 : -1;
  if (typeof a === "number" && typeof b === "number") return a - b;
  return a < b ? -1 : a > b ? 1 : 0;
}
