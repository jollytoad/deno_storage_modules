import type { StorageKey } from "@storage/types";
import { randomBetween, randomIntegerBetween, randomSeeded } from "@std/random";

/**
 * Create a set of items for use in benchmarks.
 *
 * Keys use a deterministic pseudo-random scheme with varying depth
 * (1–5 segments after prefix) and segment lengths (1–32 characters)
 * to produce realistic hierarchical storage patterns.  Values span
 * strings, numbers, booleans, null, arrays and objects — all
 * JSON-encodable.  Identical between runs — seeded with a fixed
 * value.
 */
export function createTestItems(
  prefix: StorageKey = ["bench"],
  count = 100,
): Map<StorageKey, unknown> {
  const random = randomSeeded(42n);
  const items = new Map<StorageKey, unknown>();

  for (let i = 0; i < count; i++) {
    const segments = [...prefix];
    const depth = randomIntegerBetween(1, 5, { prng: random });
    for (let d = 0; d < depth; d++) {
      segments.push(randomString(random, 1, 32));
    }
    items.set(segments, randomValue(random));
  }

  return items;
}

const CHARS = "abcdefghijklmnopqrstuvwxyz0123456789";

function randomString(
  random: () => number,
  minLen: number,
  maxLen: number,
): string {
  const len = randomIntegerBetween(minLen, maxLen, { prng: random });
  let s = "";
  for (let i = 0; i < len; i++) {
    s += CHARS[randomIntegerBetween(0, CHARS.length - 1, { prng: random })];
  }
  return s;
}

function randomValue(random: () => number, maxDepth = 3): unknown {
  if (maxDepth <= 0) {
    const t = randomIntegerBetween(0, 2, { prng: random });
    return t === 0
      ? randomString(random, 0, 64)
      : t === 1
      ? pickNumber(random)
      : random() < 0.5;
  }

  const kind = randomIntegerBetween(0, 5, { prng: random });

  switch (kind) {
    case 0:
      return randomString(random, 0, 64);
    case 1:
      return pickNumber(random);
    case 2:
      return random() < 0.5;
    case 3:
      return null;
    case 4:
      return randomArray(random, maxDepth - 1);
    case 5:
      return randomObject(random, maxDepth - 1);
    default:
      return null;
  }
}

function randomArray(random: () => number, maxDepth: number): unknown[] {
  const len = randomIntegerBetween(0, 6, { prng: random });
  const arr: unknown[] = [];
  for (let i = 0; i < len; i++) arr.push(randomValue(random, maxDepth));
  return arr;
}

function randomObject(
  random: () => number,
  maxDepth: number,
): Record<string, unknown> {
  const keyCount = randomIntegerBetween(0, 5, { prng: random });
  const obj: Record<string, unknown> = {};
  for (let i = 0; i < keyCount; i++) {
    obj[randomString(random, 1, 16)] = randomValue(random, maxDepth);
  }
  return obj;
}

function pickNumber(random: () => number): number {
  if (random() < 0.5) {
    return randomIntegerBetween(-1_000_000, 1_000_000, { prng: random });
  }
  return randomBetween(-1_000_000, 1_000_000, { prng: random });
}
