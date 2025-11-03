import { HttpMethod } from './is-http-method.js';

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
