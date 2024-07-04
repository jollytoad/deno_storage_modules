# Deno KV Storage Module

See [@jollytoad/store](https://jsr.io/@jollytoad/store) for the bigger picture.

This package provides an implementation of the storage module interface.

Uses the [Deno KV](https://deno.land/manual/runtime/kv) API for storage.

Import mapping: `"$store": "jsr:@jollytoad/store-deno-kv"`

**Example**

```ts
import * as store from "jsr:@jollytoad/store-deno-kv";
import { assertEquals } from "jsr:@std/assert";

await store.setItem(["foo", "hello"], "world");

assertEquals(await store.hasItem(["foo", "hello"]), true);
assertEquals(await store.getItem(["foo", "hello"]), "world");

await store.clearItems(["foo"]);
assertEquals(await store.hasItem(["foo", "hello"]), false);
```

## Get out of jail free

This package also supplies a utility function to obtained the actual `Deno.Kv`
of any store backed by it (that exports a `getDenoKv` function).

**Examples**

Using `getDenoKv()` with a store that uses `Deno.Kv`:

```ts
import * as store from "jsr:@jollytoad/store";
import { getDenoKv } from "jsr:@jollytoad/store-deno-kv/get-deno-kv";
import { assertEquals, assertInstanceOf } from "jsr:@std/assert";

// Set store-deno-kv
store.setStore(import("jsr:@jollytoad/store-deno-kv"));

// Get the actual Deno.Kv store
const kv = await getDenoKv(store, ["foo"]);

assertInstanceOf(kv, Deno.Kv);

await kv.atomic()
  .set(["foo", "hello"], "world")
  .commit();

assertEquals(await store.hasItem(["foo", "hello"]), true);
assertEquals(await store.getItem(["foo", "hello"]), "world");

await store.clearItems(["foo"]);
```

Or with a store that doesn't use `Deno.Kv`:

```ts
import * as store from "jsr:@jollytoad/store";
import { getDenoKv } from "jsr:@jollytoad/store-deno-kv/get-deno-kv";
import { assertStrictEquals } from "jsr:@std/assert";

// Set store-deno-kv
store.setStore(import("jsr:@jollytoad/store-deno-fs"));

// Attempt to get the actual Deno.Kv store
const kv = await getDenoKv(store, ["foo"]);

assertStrictEquals(kv, undefined);
```
