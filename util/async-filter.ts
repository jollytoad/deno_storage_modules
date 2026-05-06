/**
 * Filter an Iterable or AsyncIterable
 */
export async function* asyncFilter<T>(
  items: Iterable<T> | AsyncIterable<T>,
  filter: (item: T) => boolean,
): AsyncIterable<T> {
  for await (const item of items) {
    if (filter(item)) {
      yield item;
    }
  }
}
