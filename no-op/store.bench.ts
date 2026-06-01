import { benchStore } from "@storage/bench";
import * as store from "./mod.ts";

benchStore(store, {
  name: "@storage/no-op",
  iterations: 100,
  readonly: true,
});
