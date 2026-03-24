import {
  setup,
  teardown,
  testIsWritable,
  testListItems,
  testSetItem,
  testUrl,
} from "@storage/test";
import * as store from "./mod.ts";

Deno.test("@storage/no-op", async (t) => {
  try {
    await setup(t, store);
    await testUrl(t, store, "no-op");
    await testIsWritable(t, store, false);
    await testSetItem(t, store);
    await testListItems(t, store, []);
  } finally {
    await teardown(t, store);
  }
});
