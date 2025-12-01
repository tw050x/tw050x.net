
/**
 * Check if the given value is an array of headers (strings).
 *
 * @param value The value to check.
 * @returns True if the value is a readonly array of strings, false otherwise.
 */
export const isArrayOfHeaders = (value: unknown): value is readonly string[] => {
  if (Array.isArray(value) === false) {
    return false;
  }
  for (const item of value) {
    if (typeof item !== 'string') {
      return false;
    }
  }
  return true;
}
