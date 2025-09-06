import { database as authenticationDatabase } from '@tw050x.net.database/authentication';
import { randomBytes } from "node:crypto";

/**
 * Generates a unique nonce for the login form.
 *
 * @returns The generated nonce.
 */
export const generateLoginFormNonce = async () => {
  let existingNonce;
  let nonce;
  do {
    nonce = randomBytes(16).toString('hex');
    existingNonce = await authenticationDatabase.nonces.findOne({
      type: 'login',
      value: nonce
    });
  }
  while (existingNonce !== null);
  await authenticationDatabase.nonces.insertOne({
    createdAt: new Date(),
    type: 'login',
    value: nonce,
  });
  return nonce;
}
