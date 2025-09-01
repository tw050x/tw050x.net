
/**
 * Check if the origin is allowed
 * @param origin The origin to check
 * @param allowedOrigins The array of allowed origins
 * @returns true if the origin is allowed, false otherwise
 */
export const isAllowedOrigin = (origin: string | undefined, allowedOrigins: Array<string>): origin is string => {
  if (origin === undefined) {
    return false;
  }

  if (Array.isArray(allowedOrigins) === false) {
    return false;
  }

  const originUrl = new URL(origin);
  if (allowedOrigins.includes(originUrl.host) === false) {
    return false;
  }

  return true;
}
