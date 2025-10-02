
const httpMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS', 'TRACE', 'CONNECT'];

export type HttpMethod = typeof httpMethods[number];

/**
 * Check if value exists and is a valid HTTP method
 *
 * Returns true if value is defined and exists in the httpMethods array
 */
export const isHttpMethod = (value: string): value is HttpMethod => {
  return httpMethods.includes(value);
}

/**
 * Check if value exists and is included in allowed HTTP methods array
 * Returns true if value is defined and exists in the allowedMethods array
 * Narrows the type to the specific subset of methods provided
 */
export const isAllowedMethod = <T extends readonly HttpMethod[]>(value: string | undefined, allowedMethods: T): value is T[number] => {
  return value !== undefined && (allowedMethods as readonly string[]).includes(value);
}
