import { assertInstanceOf, assertStrictEquals } from "@std/assert";
import { getDenoKv } from "./get-deno-kv.ts";
import * as denoKvStore from "./mod.ts";
import * as denoFsStore from "@jollytoad/store-deno-fs";
import * as store from "@jollytoad/store";

Deno.test("getDenoKv() returns Deno.Kv when given store-deno-kv directly", async () => {
  try {
    const kv = await getDenoKv(denoKvStore, []);

    assertInstanceOf(kv, Deno.Kv);
  } finally {
    await denoKvStore.close();
  }
});

Deno.test("getDenoKv() returns undefined when given store-deno-fs directly", async () => {
  try {
    const kv = await getDenoKv(denoFsStore, []);

    assertStrictEquals(kv, undefined);
  } finally {
    await denoFsStore.close();
  }
});

Deno.test("getDenoKv() returns Deno.Kv when given the delegate store backed by store-deno-kv", async () => {
  try {
    store.setStore(denoKvStore);

    const kv = await getDenoKv(store, []);

    assertInstanceOf(kv, Deno.Kv);
  } finally {
    await store.close();
  }
});

Deno.test("getDenoKv() returns Deno.Kv when given the delegate store backed by store-deno-fs", async () => {
  try {
    store.setStore(denoFsStore);

    const kv = await getDenoKv(store, []);

    assertStrictEquals(kv, undefined);
  } finally {
    await store.close();
  }
});
