import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { mongoClient } from "./mongo-client";

const sessionsDatabaseName = readFileSync(resolve(__dirname, '..', '..', '.configs', 'database.sessions.name'), 'utf-8').trim();
const sessionsLoginsCollectionName = readFileSync(resolve(__dirname, '..', '..', '.configs', 'database.sessions-logins-collection.name'), 'utf-8').trim();

/**
 * Creates a session for the user with the given profile UUID.
 *
 * @param userProfileUuid - The UUID of the user profile to create a session for.
 * @returns A promise that resolves to the session cookie value.
 */
export const createSession = async (userProfileUuid: string) => {
  const createdAt = new Date();
  const updatedAt = new Date();
  const initialIpAddress = 'unknown';
  const sessionId = randomUUID();
  const sessionUuid = randomUUID();

  await mongoClient.db(sessionsDatabaseName).collection(sessionsLoginsCollectionName).insertOne({
    createdAt,
    updatedAt,
    initialIpAddress,
    id: sessionId,
    userProfileUuid,
    uuid: sessionUuid,
  });

  return { id: sessionId };
}
