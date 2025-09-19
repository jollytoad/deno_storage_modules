# Extending a Pluggable Storage Module

See [@jollytoad/store](https://jsr.io/@jollytoad/store) for the bigger picture.

This package provides a function to extend an existing storage module via a
[trait](https://en.wikipedia.org/wiki/Trait_(computer_programming)).

## Example

The following example will cause a message to be logged to the console on every
call to `setItem`.

```ts
import * as originalStore from "@jollytoad/store-deno-fs";
import { extendStore } from "@jollytoad/store-extend";

const store = extendStore(originalStore, {
  setItem(key, value) {
    console.debug(`Saving: ${key.join("/")}`);
    return this.setItem(key, value);
  },
});

await store.setItem(["foo", "bah"], "stuff");
```

## Usage

Simply define your trait object with the functions you want to override, using
`this` to refer back to the original store...

```ts
import type { StoreTrait } from "@jollytoad/store-extend/types";

const extension: StoreTrait = {
  setItem(key, value) {
    console.debug(`Saving: ${key.join("/")}`);
    return this.setItem(key, value);
  },
  getItem(key, value) {
    console.debug(`Loading: ${key.join("/")}`);
    return this.getItem(key, value);
  },
};
```

and create your extended store with `extendStore`...

```ts
const store = extendStore(originalStore, extension);
```

## Adding extra functions to a minimal store

By default the `StoreTrait` covers the `StorageModule`, but you may define a
trait that adds additional functions:

```ts
import type { StoreTrait } from "@jollytoad/store-extend/types";
import type {
  CompleteStorageModule,
  StorageModule,
} from "@jollytoad/store-common/types";
import { copyItems } from "@jollytoad/store-common/copy-items";
import { moveItems } from "@jollytoad/store-common/move-items";

const extension: StoreTrait<StorageModule, CompleteStorageModule> = {
  copyItems(fromPrefix, toPrefix) {
    return copyItems(fromPrefix, toPrefix, this);
  },
  moveItems(fromPrefix, toPrefix) {
    return moveItems(fromPrefix, toPrefix, this);
  },
};
```
