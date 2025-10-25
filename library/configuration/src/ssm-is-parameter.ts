import { Parameter } from './types.js';

/**
 * Type guard to check if a value is an Parameter
 *
 * @param value The value to check
 * @returns {boolean}
 */
export const isParameter = (value: any): value is Parameter => {
  return typeof value === 'object' && value !== null && value.source === 'ssm' && value.type === 'parameter' && typeof value.key === 'string';
}
