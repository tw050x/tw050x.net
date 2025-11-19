import { database as userDatabase } from "@tw050x.net.database/user-service";
import { ObjectId } from "mongodb";

/**
 * Inserts OAuth2 credentials for a user into the database.
 */
const insertUserOAuthCredentials = async (userProfileId: ObjectId) => {
  await userDatabase.credentials.insertOne({
    createdAt: new Date(),
    updatedAt: new Date(),
    provider: 'google',
    type: 'oauth2',
    userProfileId,
  });
}
export default insertUserOAuthCredentials;
