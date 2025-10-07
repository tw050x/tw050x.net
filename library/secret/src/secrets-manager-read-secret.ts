import { GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";
import { cache } from "./cache";
import { secretsManagerClient } from "./secrets-manager-client";

/**
 * Reads a secret value from AWS Secrets Manager. Uses a caches value if it exists and refetches the
 * value in the background if it is out of date.
 *
 * @param key The key of the secret value to read.
 * @returns The secret value as a string, or undefined if not found.
 */
export const readSecret = async (key: string) => {
  cacheGuard: {
    const cachedValue = cache.get(key);
    if (cachedValue === undefined) break cacheGuard;
    return cachedValue;
  }

  const command = new GetSecretValueCommand({
    SecretId: key
  })

  const response = await secretsManagerClient.send(command);
  const value = response.SecretString;

  if (value === undefined) {
    throw new Error(`Configuration value for key "${key}" not found in SSM Parameter Store.`);
  }

  cache.set(key, value);
  return value;
}
