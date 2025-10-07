import { Parameter } from "./types";

/**
 * Define a configuration parameter stored in AWS Systems Manager Parameter Store
 *
 * @param key The key of the parameter in Parameter Store
 * @returns {Parameter}
 */
export const useParameter = (key: string): Parameter => {

  // return {
  //   get value() {

  //   }
  // }

  return {
    key,
    source: 'ssm',
    type: 'parameter',
  }
}
