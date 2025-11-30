import { database as userDatabase } from "@tw050x.net.database/user";

/**
 * Inserts OAuth2 credentials for a user into the database.
 */
const insertUserOAuthCredentials = async (userProfileUuid: string) => {
  await userDatabase.credentials.insertOne({
    createdAt: new Date(),
    updatedAt: new Date(),
    provider: 'google',
    type: 'oauth2',
    userProfileUuid,
  });
}
export default insertUserOAuthCredentials;
