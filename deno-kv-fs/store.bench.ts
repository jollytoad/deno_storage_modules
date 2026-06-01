import { benchStore } from "@storage/bench";
import * as store from "./mod.ts";

benchStore(store, {
  name: "@storage/deno-kv-fs",
  iterations: 100,
});
