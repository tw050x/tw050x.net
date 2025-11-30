import { mongoClient } from "./client.js";

//
interface CredentialDocumentBase {
  createdAt: Date;
  updatedAt: Date;
  userProfileUuid: string;
}

//
export interface PasswordCredentialsDocument extends CredentialDocumentBase {
  passwordHash: string;
  type: 'password';
}

export interface OAuth2CredentialsDocument extends CredentialDocumentBase {
  provider: 'google';
  type: 'oauth2';
}

export type CredentialDocument = PasswordCredentialsDocument | OAuth2CredentialsDocument;

//
export type JTIDocument = {
  createdAt: Date;
  userProfileUuid: string;
  value: string;
}

//
export type NonceDocument = {
  createdAt: Date;
  type: 'register' | 'login';
  value: string;
}

//
export type PermissionsDocument = {
  createdAt: Date;
  updatedAt: Date;
  enabled: boolean;
  key: string;
}

//
export type ProfileDocument = {
  createdAt: Date;
  updatedAt: Date;
  email: string;
  emailNormalised: string;
  phone?: string;
  displayName?: string;
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
  get profiles() {
    const profileCollectionName = process.env.USER_DATABASE_PROFILES_COLLECTION_NAME;
    guard: {
      if (profileCollectionName === undefined) break guard;
      if (profileCollectionName === '') break guard;
      return mongoClient.db(process.env.USER_DATABASE_NAME).collection<ProfileDocument>(profileCollectionName);
    }
    throw new Error(`Missing environment variable: USER_DATABASE_PROFILES_COLLECTION_NAME`);
  },
}

/**
 * MongoDB Client
 */
export const client = mongoClient;
