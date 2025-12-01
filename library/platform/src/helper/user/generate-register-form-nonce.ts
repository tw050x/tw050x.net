import { database as usersDatabase } from '@tw050x.net.library/database/client/users';
import { randomBytes } from "node:crypto";

/**
 * Generates a unique nonce for the login form.
 *
 * @returns The generated nonce.
 */
export const generateRegisterFormNonce = async () => {
  let existingNonce;
  let nonce;
  do {
    nonce = randomBytes(16).toString('hex');
    existingNonce = await usersDatabase.nonces.findOne({
      type: 'register',
      value: nonce
    });
  }
  while (existingNonce !== null);
  await usersDatabase.nonces.insertOne({
    createdAt: new Date(),
    type: 'register',
    value: nonce,
  });
  return nonce;
}
