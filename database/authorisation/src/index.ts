import { DatabaseDocument } from "@tw050x.net.library/types"
import { mongoClient } from "./client.js";


export interface AuthorisationPermissionDocument extends DatabaseDocument {
  userProfileId: string;
  resource: string;
  action: string;
}

/**
 *
 */
export const collectionMeta = {
  get permission() {
    return {
      name: process.env.ASSIGNMENT_DATABASE_PERMISSION_COLLECTION_NAME
    };
  },
}

/**
 * Database object
 */
export const database = {
  get permission() {
    const permissionCollectionName = collectionMeta.permission.name;
    guard: {
      if (permissionCollectionName === '') break guard;
      return mongoClient.db(process.env.ASSIGNMENT_DATABASE_NAME).collection<AuthorisationPermissionDocument>(permissionCollectionName);
    }
    throw new Error(`Missing environment variable: ASSIGNMENT_DATABASE_PERMISSION_COLLECTION_NAME`);
  },
}

/**
 * MongoDB Client
 */
export const client = mongoClient;
