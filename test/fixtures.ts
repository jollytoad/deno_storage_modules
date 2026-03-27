import type { StorageKey } from "@storage/types";

/**
 * Common storage key prefix used in test cases
 */
export const TEST_PREFIX: StorageKey = ["store"];

/**
 * Common items used in test cases
 */
export const TEST_ITEMS: Map<StorageKey, unknown> = createTestItems();

/**
 * Create a set of items for use in tests
 */
export function createTestItems(
  prefix: StorageKey = TEST_PREFIX,
): Map<StorageKey, unknown> {
  return new Map<StorageKey, unknown>([
    [[...prefix, "number"], 100],
    [[...prefix, "string"], "string"],
    [[...prefix, "true_"], true],
    [[...prefix, "false_"], false],
    [[...prefix, "object"], { one: 1 }],
    [[...prefix, "array"], ["a", "b", "c"]],
    [[...prefix, 123], "number key"],
    [[...prefix, true], "true key"],
    [[...prefix, false], "false key"],
  ]);
}
