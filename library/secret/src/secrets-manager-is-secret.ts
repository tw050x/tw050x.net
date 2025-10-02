import { Secret } from './types';

/**
 * Type guard to check if a value is an Secret
 *
 * @param value The value to check
 * @returns {boolean}
 */
export const isSecret = (value: any): value is Secret => {
  return typeof value === 'object' && value !== null && value.source === 'secrets-manager' && value.type === 'secret' && typeof value.key === 'string';
}
