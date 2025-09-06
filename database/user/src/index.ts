import { mongoClient } from "./client";

/**
 * Database object
 */
export const database = {
  get nonces() {
    const noncesCollectionName = process.env.SERVICE_USER_DATABASE_NONCES_COLLECTION_NAME;
    guard: {
      if (noncesCollectionName === undefined) break guard;
      if (noncesCollectionName === '') break guard;
      return mongoClient.db(process.env.SERVICE_USER_DATABASE_NAME).collection(noncesCollectionName);
    }
    throw new Error(`Missing environment variable: SERVICE_USER_DATABASE_NONCES_COLLECTION_NAME`);
  },
}
