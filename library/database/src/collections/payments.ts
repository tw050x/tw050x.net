import { read as readConstant } from "../helper/constants.js";
import { mongoClient } from "../client.js";

//
export type NoncesDocument = {
  createdAt: Date;
  type: 'unknown';
  value: string;
}

/**
 *
 */
export const collectionMeta = {
  get nonces() {
    return {
      name: readConstant('database.payments-nonces-collection.name'),
    };
  },
}

/**
 * Database object
 */
export const database = {
  get nonces() {
    const databaseName = readConstant('database.payments.name');
    const noncesCollectionName = collectionMeta.nonces.name
    guard: {
      if (noncesCollectionName === undefined) break guard;
      if (noncesCollectionName === '') break guard;
      return mongoClient.db(databaseName).collection<NoncesDocument>(noncesCollectionName);
    }
    throw new Error(`Missing config: database.payments-nonces-collection.name`);
  },
}

/**
 * MongoDB Client
 */
export const client = mongoClient;
