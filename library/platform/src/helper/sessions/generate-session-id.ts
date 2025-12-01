import { database as sessionsDatabase } from '@tw050x.net.library/database/client/sessions';
import { randomBytes } from "node:crypto";

/**
 * Generates a unique id for the session.
 *
 * @returns The generated nonce.
 */
export const generateSessionId = async () => {
  let existingLogin;
  let id;
  do {
    id = randomBytes(32).toString('hex');
    existingLogin = await sessionsDatabase.logins.findOne({
      id: id
    });
  }
  while (existingLogin !== null);
  return id;
}
