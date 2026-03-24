import { testStore } from "@storage/test";
import * as store from "./mod.ts";

Deno.test("@storage/deno-kv-fs", async (t) => {
  await testStore(t, store, { urlIncludes: "deno-kv-fs", orderedByKey: true });
});
