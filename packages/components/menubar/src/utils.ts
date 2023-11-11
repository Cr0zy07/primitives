/**
 * Wraps an array around itself at a given start index
 * Example: `wrapArray(['a', 'b', 'c', 'd'], 2) === ['c', 'd', 'a', 'b']`
 */
export function wrapArray<T>(array: T[], startIndex: number) {
  return array.map((_, index) => array[(startIndex + index) % array.length])
}
