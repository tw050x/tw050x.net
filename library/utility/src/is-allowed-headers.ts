
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


/**
 * Check if all requested headers are included in the allowed headers array
 * Parses comma-separated header string from Access-Control-Request-Headers
 *
 * @param headers
 * @param allowedHeaders
 * @returns true if all headers are defined and exist in the allowedHeaders array
 */
export const isAllowedHeader = (headers: string | undefined, allowedHeaders: readonly string[]): headers is string => {
  if (headers === undefined) {
    return false;
  }

  if (Array.isArray(allowedHeaders) === false) {
    return false;
  }

  // Parse comma-separated headers and normalize them
  const headersList = headers
    .split(',')
    .map(header => header.trim().toLowerCase());

  // Convert allowed headers to lowercase for case-insensitive comparison
  const normalizedAllowedHeaders = allowedHeaders.map(header => header.toLowerCase());

  // Check if all requested headers are in the allowed list
  return headersList.every(header => normalizedAllowedHeaders.includes(header));
}
