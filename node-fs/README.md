# Node.js Filesystem Storage Module

See [@storage/main](https://jsr.io/@storage/main) for the bigger picture.

This package provides an implementation of the storage module interface.

This stores values in individual files under a directory hierarchy via
[Node fs](https://nodejs.org/docs/latest/api/fs.html) calls. By default this is
under a `.store` dir under the current working dir. This can be overridden via
the environment var `STORE_FS_ROOT`.

Each level of the key becomes a directory up to the last segment which becomes a
JSON file.

eg: `["one", "two", "three"]` -> `.store/one/two/three.json`

Import mapping: `"$store": "jsr:@storage/node-fs"`

**Example**

```ts
import * as store from "jsr:@storage/node-fs";
import { assertEquals } from "jsr:@std/assert";

await store.setItem(["foo", "hello"], "world");

assertEquals(await store.hasItem(["foo", "hello"]), true);
assertEquals(await store.getItem(["foo", "hello"]), "world");

await store.clearItems(["foo"]);
assertEquals(await store.hasItem(["foo", "hello"]), false);
```
