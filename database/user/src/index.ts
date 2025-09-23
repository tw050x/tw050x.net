import { mongoClient } from "./client";

//
export type CredentialDocument = {
  createdAt: Date;
  email: string;
  passwordHash: string;
  updatedAt: Date;
  uuid: string;
}

//
export type NonceDocument = {
  createdAt: Date;
  type: 'register';
  value: string;
}

//
export type PermissionsDocument = {
  createdAt: Date;
  updatedAt: Date;
  enabled: boolean;
  key: string;
  uuid: string;
}

//
export type ProfileDocument = {
  createdAt: Date;
  updatedAt: Date;
  uuid: string;
}

/**
 * Database object
 */
export const database = {
  get credentials() {
    const credentialsCollectionName = process.env.USER_DATABASE_CREDENTIALS_COLLECTION_NAME;
    guard: {
      if (credentialsCollectionName === undefined) break guard;
      if (credentialsCollectionName === '') break guard;
      return mongoClient.db(process.env.USER_DATABASE_NAME).collection<CredentialDocument>(credentialsCollectionName);
    }
    throw new Error(`Missing environment variable: USER_DATABASE_CREDENTIALS_COLLECTION_NAME`);
  },
  get nonces() {
    const noncesCollectionName = process.env.USER_DATABASE_NONCES_COLLECTION_NAME;
    guard: {
      if (noncesCollectionName === undefined) break guard;
      if (noncesCollectionName === '') break guard;
      return mongoClient.db(process.env.USER_DATABASE_NAME).collection<NonceDocument>(noncesCollectionName);
    }
    throw new Error(`Missing environment variable: USER_DATABASE_NONCES_COLLECTION_NAME`);
  },
  get permissions() {
    const permissionsCollectionName = process.env.USER_DATABASE_PERMISSIONS_COLLECTION_NAME;
    guard: {
      if (permissionsCollectionName === undefined) break guard;
      if (permissionsCollectionName === '') break guard;
      return mongoClient.db(process.env.USER_DATABASE_NAME).collection<PermissionsDocument>(permissionsCollectionName);
    }
    throw new Error(`Missing environment variable: USER_DATABASE_PERMISSIONS_COLLECTION_NAME`);
  },
  get profile() {
    const profileCollectionName = process.env.USER_DATABASE_PROFILE_COLLECTION_NAME;
    guard: {
      if (profileCollectionName === undefined) break guard;
      if (profileCollectionName === '') break guard;
      return mongoClient.db(process.env.USER_DATABASE_NAME).collection<ProfileDocument>(profileCollectionName);
    }
    throw new Error(`Missing environment variable: USER_DATABASE_PROFILE_COLLECTION_NAME`);
  },
}

/**
 * MongoDB Client
 */
export const client = mongoClient;
