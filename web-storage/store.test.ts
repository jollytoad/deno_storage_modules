import { testStore } from "@storage/test";
import * as store from "./mod.ts";

Deno.test("@storage/web-storage", async (t) => {
  await testStore(t, store, {
    urlIncludes: "web-storage",
    orderedByKey: true,
  });
});
