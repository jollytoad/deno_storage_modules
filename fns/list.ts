import type {
  ListItemsOptions,
  StorageKey,
  StorageProvider,
} from "@storage/types";
import { canGetItems, getItems } from "./get-items.ts";

/**
 * Default implementation for listItems if store doesn't provide it.
 */
export function listItems<T>(
  store: StorageProvider,
  prefix: StorageKey | undefined,
  options?: ListItemsOptions,
): AsyncIterable<[StorageKey, T]> {
  if (store.listItems) {
    return store.listItems(prefix, options);
  } else if (store.listKeys) {
    return getItems(store, store.listKeys());
  } else {
    return empty();
  }
}

/**
 * Can `listItems` by used on the store?
 */
export function canListItems(store: StorageProvider): boolean {
  return !!store.listItems || (canListKeys(store) && canGetItems(store));
}

/**
 * Default implementation for listValues if store doesn't provide it.
 */
export function listValues<T>(
  store: StorageProvider,
  prefix: StorageKey | undefined,
  options?: ListItemsOptions,
): AsyncIterable<T> {
  if (store.listValues) {
    return store.listValues(prefix, options);
  } else if (store.listItems) {
    return extractValues(store.listItems(prefix, options));
  } else if (store.listKeys) {
    return extractValues(listItems(store, prefix, options));
  } else {
    return empty();
  }
}

/**
 * Can `listValues` by used on the store?
 */
export function canListValues(store: StorageProvider): boolean {
  return !!store.listValues || canListItems(store);
}

/**
 * Default implementation for listKeys if store doesn't provide it.
 */
export function listKeys(
  store: StorageProvider,
  prefix: StorageKey | undefined,
  options?: ListItemsOptions,
): AsyncIterable<StorageKey> {
  if (store.listKeys) {
    return store.listKeys(prefix, options);
  } else if (store.listItems) {
    return extractKeys(store.listItems(prefix, options));
  } else {
    return empty();
  }
}

/**
 * Can `listKeys` by used on the store?
 */
export function canListKeys(store: StorageProvider): boolean {
  return !!store.listKeys || !!store.listItems;
}

async function* extractValues<T>(
  it: AsyncIterable<[StorageKey, T]>,
): AsyncIterable<T> {
  for await (const [_, value] of it) {
    yield value;
  }
}

async function* extractKeys(
  it: AsyncIterable<[StorageKey, unknown]>,
): AsyncIterable<StorageKey> {
  for await (const [key, _] of it) {
    yield key;
  }
}

async function* empty() {
  // do nothing
}
