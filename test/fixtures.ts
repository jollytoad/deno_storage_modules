import type { StorageKey } from "@storage/types";

/**
 * Common storage key prefix used in test cases
 */
export const TEST_PREFIX: StorageKey = ["store"];

/**
 * Common items used in test cases
 */
export const TEST_ITEMS: Map<StorageKey, unknown> = new Map<
  StorageKey,
  unknown
>([
  [[...TEST_PREFIX, "number"], 100],
  [[...TEST_PREFIX, "string"], "string"],
  [[...TEST_PREFIX, "true_"], true],
  [[...TEST_PREFIX, "false_"], false],
  [[...TEST_PREFIX, "object"], { one: 1 }],
  [[...TEST_PREFIX, "array"], ["a", "b", "c"]],
  [[...TEST_PREFIX, 123], "number key"],
  [[...TEST_PREFIX, true], "true key"],
  [[...TEST_PREFIX, false], "false key"],
]);
