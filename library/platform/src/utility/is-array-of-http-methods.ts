import { HttpMethod, isHttpMethod } from './is-http-method.js';

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
