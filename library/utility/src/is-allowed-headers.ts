/**
 * Check if all requested headers are included in the allowed headers array
 * Parses comma-separated header string from Access-Control-Request-Headers
 * Returns true if all headers are defined and exist in the allowedHeaders array
 */
export const isAllowedHeaders = (headers: string | undefined, allowedHeaders: readonly string[]): headers is string => {
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
