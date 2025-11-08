import { Parameter } from "./types.js";

/**
 * Define a configuration parameter stored in AWS Systems Manager Parameter Store
 *
 * @param key The key of the parameter in Parameter Store
 * @returns {Parameter}
 */
export const parameter = (key: string): Parameter => {

  return {
    key,
    source: 'ssm',
    type: 'parameter',
  }
}
