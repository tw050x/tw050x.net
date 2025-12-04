import { createCipheriv, randomBytes } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Create an encrypted login cookie for testing purposes.
 *
 * @param content - The content to encrypt and store in the cookie.
 * @returns A promise that resolves when the cookie has been set.
 */
export const createEncryptedLoginCookieValue = async (content: string): Promise<string> => {
  const encrypterSecretKey = readFileSync(resolve(__dirname, '..', '..', '.secrets', 'encryption.cipher.secret-key'), 'utf-8');

  // Set cookie with domain, path, and other options
  const iv = randomBytes(16);
  const cipher = createCipheriv('aes-256-cbc', Buffer.from(encrypterSecretKey, 'hex'), iv);
  let encrypted = cipher.update(content, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return JSON.stringify({
    iv: iv.toString('hex'),
    content: encrypted
  });
}
