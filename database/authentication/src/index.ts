import { mongoClient } from "./client.js";

/**
 * Database object
 */
export const database = {
  get nonces() {
    const noncesCollectionName = process.env.AUTHENTICATION_DATABASE_NONCES_COLLECTION_NAME;
    guard: {
      if (noncesCollectionName === undefined) break guard;
      if (noncesCollectionName === '') break guard;
      return mongoClient.db(process.env.AUTHENTICATION_DATABASE_NAME).collection(noncesCollectionName);
    }
    throw new Error(`Missing environment variable: AUTHENTICATION_DATABASE_NONCES_COLLECTION_NAME`);
  },
}

/**
 * MongoDB client instance
 */
export const client = mongoClient;
