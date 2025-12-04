import { read as readConfig } from "../helper/configs.js";
import { DatabaseDocument } from "../types.js";
import { mongoClient } from "../client.js";

//
export interface AuthorisationPermissionsDocument extends DatabaseDocument {
  userProfileId: string;
  resource: string;
  action: string;
}

/**
 *
 */
export const collectionMeta = {
  get permissions() {
    return {
      name: readConfig('database.authorisation-permissions-collection.name'),
    };
  },
}

/**
 * Database object
 */
export const database = {
  get permissions() {
    const databaseName = readConfig('database.authorisation.name');
    const permissionsCollectionName = collectionMeta.permissions.name;
    guard: {
      if (permissionsCollectionName === '') break guard;
      return mongoClient.db(databaseName).collection<AuthorisationPermissionsDocument>(permissionsCollectionName);
    }
    throw new Error(`Missing config: database.authorisation-permissions-collection.name`);
  },
}

/**
 * MongoDB Client
 */
export const client = mongoClient;
