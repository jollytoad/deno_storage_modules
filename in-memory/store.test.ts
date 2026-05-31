import { testStore } from "@storage/test";
import * as store from "./mod.ts";

Deno.test("@storage/in-memory", async (t) => {
  await testStore(t, store, {
    urlIncludes: "in-memory",
  });
});
