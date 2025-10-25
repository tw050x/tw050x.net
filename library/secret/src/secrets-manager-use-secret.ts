import { Secret } from "./types.js";

/**
 * Define a secret stored in AWS Secrets Manager
 *
 * @param key The key of the secret in Secrets Manager
 * @returns {Secret}
 */
export const useSecret = (key: string): Secret => {
  return {
    key,
    source: 'secrets-manager',
    type: 'secret',
  }
}
