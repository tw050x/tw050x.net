import { database as userDatabase } from '@tw050x.net.database/user-service';
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
    existingNonce = await userDatabase.nonces.findOne({
      type: 'register',
      value: nonce
    });
  }
  while (existingNonce !== null);
  await userDatabase.nonces.insertOne({
    createdAt: new Date(),
    type: 'register',
    value: nonce,
  });
  return nonce;
}
