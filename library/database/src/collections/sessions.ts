import { read as readConfig } from "../helper/configs.js";
import { mongoClient } from "../client.js";

//
export type ActivityDocument = {
  activity: string;
  activityAt: Date;
  createdAt: Date;
  loginUuid: string;
  userProfileUuid: string;
}

//
export type LoginsDocument = {
  createdAt: Date;
  expiredAt?: Date;
  id: string;
  initialIpAddress: string;
  userProfileUuid: string;
  uuid: string;
}

/**
 *
 */
export const collectionMeta = {
  get activity() {
    return {
      name: readConfig('database.sessions-activity-collection.name'),
    };
  },
  get logins() {
    return {
      name: readConfig('database.sessions-logins-collection.name'),
    };
  },
}

/**
 * Database object
 */
export const database = {
  get activity() {
    const databaseName = readConfig('database.sessions.name');
    const activityCollectionName = collectionMeta.activity.name;
    guard: {
      if (activityCollectionName === undefined) break guard;
      if (activityCollectionName === '') break guard;
      return mongoClient.db(databaseName).collection<ActivityDocument>(activityCollectionName);
    }
    throw new Error(`Missing config: database.sessions-activity-collection.name`);
  },
  get logins() {
    const databaseName = readConfig('database.sessions.name');
    const loginsCollectionName = collectionMeta.logins.name;
    guard: {
      if (loginsCollectionName === undefined) break guard;
      if (loginsCollectionName === '') break guard;
      return mongoClient.db(databaseName).collection<LoginsDocument>(loginsCollectionName);
    }
    throw new Error(`Missing config: database.sessions-logins-collection.name`);
  },
}

/**
 * MongoDB Client
 */
export const client = mongoClient;
