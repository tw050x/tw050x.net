import { GetParameterCommand } from "@aws-sdk/client-ssm";
import { logger } from "@tw050x.net.library/logger";
import { cache } from "./cache";
import { ssmClient } from "./ssm-client";

/**
 * Reads a configuration value from AWS SSM Parameter Store. Uses a caches value if it exists and refetches the
 * value in the background if it is out of date.
 *
 * @param key The key of the configuration value to read.
 * @param withDecryption Whether to decrypt the value if it is encrypted. Default is false.
 * @returns The configuration value as a string, or undefined if not found.
 */
export const readParameter = async (key: string, withDecryption: boolean = false) => {
  cacheGuard: {
    const cachedValue = cache.get(key);
    if (cachedValue === undefined) break cacheGuard;
    return cachedValue;
  }

  const command = new GetParameterCommand({
    Name: key,
    WithDecryption: withDecryption
  })

  let response;
  try {
    response = await ssmClient.send(command);
  }
  catch (error) {
    return void logger.error(error);
  }

  const value = response.Parameter?.Value;

  if (value === undefined) {
    return void logger.warn(`Configuration value for key "${key}" not found in SSM Parameter Store.`);
  }

  cache.set(key, value);
  return value;
}
