import { testStore } from "@storage/test";
import * as store from "./mod.ts";

Deno.test("@storage/deno-kv", async (t) => {
  await testStore(t, store, {
    urlIncludes: "deno-kv",
    orderedByKey: true,
    batchAtomic: [undefined, "preferred"],
  });
});
