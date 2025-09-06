
export type AllowedHttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS' | 'TRACE' | 'CONNECT';

/**
 * Check if value exists and is included in allowed HTTP methods array
 * Returns true if value is defined and exists in the allowedMethods array
 * Narrows the type to the specific subset of methods provided
 */
export const isAllowedMethod = <T extends readonly AllowedHttpMethod[]>(value: string | undefined, allowedMethods: T): value is T[number] => {
  return value !== undefined && (allowedMethods as readonly string[]).includes(value);
}
