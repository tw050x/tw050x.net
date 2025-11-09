import { logger } from '@tw050x.net.library/logger';
import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

/**
 * Encrypts the given state using the provided key.
 *
 * @param state - The state to encrypt.
 * @param key - The key to use for encryption.
 * @returns The encrypted state as a string.
 */
export const encrypt = (state: string, key: string): string => {
  const iv = randomBytes(16);
  const cipher = createCipheriv('aes-256-cbc', Buffer.from(key, 'hex'), iv);

  let encryptedState;

  encryptedState = cipher.update(state, 'utf8', 'hex');
  encryptedState += cipher.final('hex');

  return JSON.stringify({
    iv: iv.toString('hex'),
    content: encryptedState
  });
}

/**
 * Decrypts the given encrypted state using the provided key.
 *
 * @param encryptedState - The encrypted state to decrypt.
 * @param key - The key to use for decryption.
 * @returns The decrypted state as a string.
 */
export const decrypt = (encryptedState: string, key: string): Record<string, unknown> => {
  let parsedEncryptedState;
  try {
    parsedEncryptedState = JSON.parse(encryptedState);
  }
  catch (error) {
    logger.error(error);
    throw new Error('Invalid encrypted state format');
  }

  // Destructure iv and content from parsed object
  const { iv, content } = parsedEncryptedState;
  const decipher = createDecipheriv('aes-256-cbc', Buffer.from(key, 'hex'), Buffer.from(iv, 'hex'));

  // Decrypt content
  let decryptedState = decipher.update(content, 'hex', 'utf8');
  decryptedState += decipher.final('utf8');

  let parsedDecryptedState;
  try {
    parsedDecryptedState = JSON.parse(decryptedState);
  }
  catch (error) {
    logger.error(error);
    throw new Error('Invalid decrypted state format');
  }

  return parsedDecryptedState;
}
