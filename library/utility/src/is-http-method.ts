
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
