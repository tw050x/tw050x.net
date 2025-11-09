import { database as userDatabase } from '@tw050x.net.database/user';
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
    existingNonce = await userDatabase.nonces.findOne({
      type: 'login',
      value: nonce
    });
  }
  while (existingNonce !== null);
  await userDatabase.nonces.insertOne({
    createdAt: new Date(),
    type: 'login',
    value: nonce,
  });
  return nonce;
}
