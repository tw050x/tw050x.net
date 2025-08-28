import { mongoClient } from "@tw050x.net/service";

/**
 * Database object
 */
export const database = {
  authentication: {
    get credentials() {
      const credentialsCollectionName = process.env.SERVICE_AUTHENTICATION_DATABASE_CREDENTIALS_COLLECTION_NAME;
      guard: {
        if (credentialsCollectionName === undefined) break guard;
        if (credentialsCollectionName === '') break guard;
        return mongoClient.db(process.env.SERVICE_AUTHENTICATION_DATABASE_NAME).collection(credentialsCollectionName);
      }
      throw new Error(`Missing environment variable: SERVICE_AUTHENTICATION_DATABASE_CREDENTIALS_COLLECTION_NAME`);
    },
    get nonces() {
      const noncesCollectionName = process.env.SERVICE_AUTHENTICATION_DATABASE_NONCES_COLLECTION_NAME;
      guard: {
        if (noncesCollectionName === undefined) break guard;
        if (noncesCollectionName === '') break guard;
        return mongoClient.db(process.env.SERVICE_AUTHENTICATION_DATABASE_NAME).collection(noncesCollectionName);
      }
      throw new Error(`Missing environment variable: SERVICE_AUTHENTICATION_DATABASE_NONCES_COLLECTION_NAME`);
    },
    get permissions() {
      const permissionsCollectionName = process.env.SERVICE_AUTHENTICATION_DATABASE_PERMISSIONS_COLLECTION_NAME;
      guard: {
        if (permissionsCollectionName === undefined) break guard;
        if (permissionsCollectionName === '') break guard;
        return mongoClient.db(process.env.SERVICE_AUTHENTICATION_DATABASE_NAME).collection(permissionsCollectionName);
      }
      throw new Error(`Missing environment variable: SERVICE_AUTHENTICATION_DATABASE_PERMISSIONS_COLLECTION_NAME`);
    },
  }
}
