
/**
 * Asserts that a value is unreachable.
 *
 * @param value
 * @param message
 */
export const assertUnreachable = (_: never, message?: string): never => {
  throw new Error(message);
}
