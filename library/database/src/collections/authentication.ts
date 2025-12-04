import { read as readConfig } from "../helper/configs.js";
import { mongoClient } from "../client.js";

//
export type NonceDocument = {
  createdAt: Date;
  type: 'register' | 'login';
  value: string;
}

/**
 *
 */
export const collectionMeta = {
  get nonces() {
    return {
      name: readConfig('database.authentication-nonces-collection.name'),
    };
  },
}

/**
 * Database object
 */
export const database = {
  get nonces() {
    const databaseName = readConfig('database.authentication.name');
    const noncesCollectionName = collectionMeta.nonces.name;
    guard: {
      if (noncesCollectionName === undefined) break guard;
      if (noncesCollectionName === '') break guard;
      return mongoClient.db(databaseName).collection<NonceDocument>(noncesCollectionName);
    }
    throw new Error(`Missing config: database.authentication-nonces-collection.name`);
  },
}

/**
 * MongoDB Client
 */
export const client = mongoClient;
