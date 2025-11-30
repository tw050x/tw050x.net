import { hash } from "bcryptjs";
import { mongoClient } from "./mongo-client";

/**
 * Create a user directly in the database for testing purposes.
 *
 * @param email - The email of the user to create.
 * @param password - The password of the user to create.
 * @returns A promise that resolves when the user has been created.
 */
export const createUser = async (email: string, password: string): Promise<null> => {
  const createdAt = new Date();
  const updatedAt = new Date();
  const passwordHash = await hash(password, 10);
  const uuid = crypto.randomUUID();
  await mongoClient.db(process.env.USER_DATABASE_NAME).collection(process.env.USER_DATABASE_CREDENTIALS_COLLECTION_NAME).insertOne({
    createdAt,
    updatedAt,
    email,
    passwordHash,
    uuid,
  });
  await mongoClient.db(process.env.USER_DATABASE_NAME).collection(process.env.USER_DATABASE_PROFILES_COLLECTION_NAME).insertOne({
    createdAt,
    updatedAt,
    uuid,
  });
  return null
}
