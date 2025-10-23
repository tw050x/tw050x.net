
const httpMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS', 'TRACE', 'CONNECT'];

export type HttpMethod = typeof httpMethods[number];

/**
 * Check if value exists and is a valid HTTP method
 *
 * @param value
 * @returns true if value is defined and exists in the httpMethods array
 */
export const isHttpMethod = (value: string): value is HttpMethod => {
  return httpMethods.includes(value);
}

/**
 * Check if value is an array of valid HTTP methods
 *
 * @param value
 * @returns true if value is an array and all items are valid HTTP methods
 */
export const isArrayOfHttpMethods = (value: unknown): value is readonly HttpMethod[] => {
  if (Array.isArray(value) === false) {
    return false;
  }
  for (const item of value) {
    if (isHttpMethod(item) === false) {
      return false;
    }
  }
  return true;
}

/**
 * Check if value exists and is included in allowed HTTP methods array
 * Narrows the type to the specific subset of methods provided
 *
 * @param value
 * @param allowedMethods
 * @returns true if value is defined and exists in the allowedMethods array
 */
export const isAllowedMethod = <T extends readonly HttpMethod[]>(value: string | undefined, allowedMethods: T): value is T[number] => {
  return value !== undefined && (allowedMethods as readonly string[]).includes(value);
}
