import { GetParameterCommand } from '@aws-sdk/client-ssm';
import { GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import { createCipheriv, randomBytes } from 'node:crypto';
import { secretsManagerClient } from './secrets-manager-client';
import { ssmClient } from './ssm-client';


/**
 * Create an encrypted login cookie for testing purposes.
 *
 * @param content - The content to encrypt and store in the cookie.
 * @returns A promise that resolves when the cookie has been set.
 */
export const createEncryptedLoginCookieValue = async (content: string): Promise<string> => {
  const encrypterSecretKeyResponse = await secretsManagerClient.send(
    new GetSecretValueCommand({
      SecretId: 'encrypter.secret-key',
    })
  )
  const encrypterSecretKey = encrypterSecretKeyResponse.SecretString;
  const stateCipherAlgorithmResponse = await ssmClient.send(
    new GetParameterCommand({
      Name: 'cookie.login-state.cipher.algorithm',
      WithDecryption: false,
    })
  )
  const stateCipherAlgorithm = stateCipherAlgorithmResponse.Parameter.Value;
  // Set cookie with domain, path, and other options
  const iv = randomBytes(16);
  const cipher = createCipheriv(stateCipherAlgorithm, Buffer.from(encrypterSecretKey, 'hex'), iv);
  let encrypted = cipher.update(content, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return JSON.stringify({
    iv: iv.toString('hex'),
    content: encrypted
  })
}
