import { database } from '@tw050x.net/database';
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
    existingNonce = await database.authentication.nonces.findOne({
      type: 'login',
      value: nonce
    });
  }
  while (existingNonce !== null);
  await database.authentication.nonces.insertOne({
    createdAt: new Date(),
    type: 'login',
    value: nonce,
  });
  return nonce;
}
