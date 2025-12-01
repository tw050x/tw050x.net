import { mongoClient } from "./client.js";

//
export type NonceDocument = {
  createdAt: Date;
  type: 'register' | 'login';
  value: string;
}

/**
 * Database object
 */
export const database = {
  get nonces() {
    const noncesCollectionName = process.env.USER_DATABASE_NONCES_COLLECTION_NAME;
    guard: {
      if (noncesCollectionName === undefined) break guard;
      if (noncesCollectionName === '') break guard;
      return mongoClient.db(process.env.USER_DATABASE_NAME).collection<NonceDocument>(noncesCollectionName);
    }
    throw new Error(`Missing environment variable: USER_DATABASE_NONCES_COLLECTION_NAME`);
  },
}

/**
 * MongoDB Client
 */
export const client = mongoClient;
