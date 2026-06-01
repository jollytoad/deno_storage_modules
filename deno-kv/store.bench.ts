import { benchStore } from "@storage/bench";
import * as store from "./mod.ts";

benchStore(store, {
  name: "@storage/deno-kv",
  iterations: 100,
});
