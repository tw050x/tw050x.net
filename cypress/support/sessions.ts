import { randomBytes, randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { mongoClient } from "./mongo-client";

const sessionsDatabaseName = readFileSync(resolve(__dirname, '..', '..', '.configs', 'database.sessions.name'), 'utf-8').trim();
const sessionsLoginsCollectionName = readFileSync(resolve(__dirname, '..', '..', '.configs', 'database.sessions-logins-collection.name'), 'utf-8').trim();

type CreateSessionOverrides = {
  createdAt?: string;
  initialIpAddress?: string;
  lastAuthenticatedAt?: string;
  timeoutAt?: string;
}

/**
 * Creates a session for the user with the given profile UUID.
 *
 * @param userProfileUuid - The UUID of the user profile to create a session for.
 * @returns A promise that resolves to the session cookie value.
 */
export const createSession = async (userProfileUuid: string, overrides?: CreateSessionOverrides) => {
  const currentDate = new Date();

  const createdAt = overrides?.createdAt ?? currentDate;
  const initialIpAddress = overrides?.initialIpAddress ?? 'unknown';
  const lastAuthenticatedAt = overrides?.lastAuthenticatedAt ?? currentDate;
  const sessionId = randomBytes(32).toString('hex');
  const sessionUuid = randomUUID();
  const timeoutAt = overrides?.timeoutAt ? new Date(overrides.timeoutAt) : new Date(currentDate.getTime() + (15 * 60 * 1000)); // default to 15 minutes from now

  await mongoClient.db(sessionsDatabaseName).collection(sessionsLoginsCollectionName).insertOne({
    createdAt,
    id: sessionId,
    initialIpAddress,
    lastAuthenticatedAt,
    timeoutAt,
    userProfileUuid,
    uuid: sessionUuid,
  });

  return { id: sessionId };
}
