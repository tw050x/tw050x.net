import { mongoClient } from "./client.js";

//
export type ActivityDocument = {
  activity: string;
  createdAt: Date;
  userProfileUuid: string;
}

//
export type LoginsDocument = {
  createdAt: Date;
  expiredAt?: Date;
  id: string;
  initialIpAddress: string;
  userProfileUuid: string;
}

/**
 * Database object
 */
export const database = {
  get activity() {
    const activityCollectionName = process.env.SESSIONS_DATABASE_ACTIVITY_COLLECTION_NAME;
    guard: {
      if (activityCollectionName === undefined) break guard;
      if (activityCollectionName === '') break guard;
      return mongoClient.db(process.env.SESSIONS_DATABASE_NAME).collection<ActivityDocument>(activityCollectionName);
    }
    throw new Error(`Missing environment variable: SESSIONS_DATABASE_ACTIVITY_COLLECTION_NAME`);
  },
  get logins() {
    const loginsCollectionName = process.env.SESSIONS_DATABASE_LOGINS_COLLECTION_NAME;
    guard: {
      if (loginsCollectionName === undefined) break guard;
      if (loginsCollectionName === '') break guard;
      return mongoClient.db(process.env.SESSIONS_DATABASE_NAME).collection<LoginsDocument>(loginsCollectionName);
    }
    throw new Error(`Missing environment variable: SESSIONS_DATABASE_LOGINS_COLLECTION_NAME`);
  },
}

/**
 * MongoDB Client
 */
export const client = mongoClient;
