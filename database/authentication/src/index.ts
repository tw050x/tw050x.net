import { mongoClient } from "./client";

/**
 * Database object
 */
export const database = {
  get nonces() {
    const noncesCollectionName = process.env.SERVICE_AUTHENTICATION_DATABASE_NONCES_COLLECTION_NAME;
    guard: {
      if (noncesCollectionName === undefined) break guard;
      if (noncesCollectionName === '') break guard;
      return mongoClient.db(process.env.SERVICE_AUTHENTICATION_DATABASE_NAME).collection(noncesCollectionName);
    }
    throw new Error(`Missing environment variable: SERVICE_AUTHENTICATION_DATABASE_NONCES_COLLECTION_NAME`);
  },
}

/**
 * MongoDB client instance
 */
export const client = mongoClient;
