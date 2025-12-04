import { hash } from "bcryptjs";
import { randomUUID } from "node:crypto"
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { mongoClient } from "./mongo-client";

const userDatabaseName = readFileSync(resolve(__dirname, '..', '..', '.configs', 'database.users.name'), 'utf-8').trim();
const userDatabaseCredentialsCollectionName = readFileSync(resolve(__dirname, '..', '..', '.configs', 'database.users-credentials-collection.name'), 'utf-8').trim();
const userDatabaseProfilesCollectionName = readFileSync(resolve(__dirname, '..', '..', '.configs', 'database.users-profiles-collection.name'), 'utf-8').trim();

/**
 * Create a user directly in the database for testing purposes.
 *
 * @param email - The email of the user to create.
 * @param password - The password of the user to create.
 * @returns A promise that resolves when the user has been created.
 */
export const createUser = async (email: string, password: string): Promise<{ uuid: string }> => {
  const createdAt = new Date();
  const updatedAt = new Date();
  const passwordHash = await hash(password, 10);
  const uuid = randomUUID();
  await mongoClient.db(userDatabaseName).collection(userDatabaseProfilesCollectionName).insertOne({
    createdAt,
    updatedAt,
    email,
    emailNormalised: email,
    uuid,
  });
  await mongoClient.db(userDatabaseName).collection(userDatabaseCredentialsCollectionName).insertOne({
    createdAt,
    updatedAt,
    passwordHash,
    type: "password",
    userProfileUuid: uuid,
  });
  return { uuid }
}
