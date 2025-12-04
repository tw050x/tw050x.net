import { read as readConfig } from "../helper/configs.js";
import { mongoClient } from "../client.js";

//
interface CredentialsDocumentBase {
  createdAt: Date;
  updatedAt: Date;
  userProfileUuid: string;
}

//
export interface PasswordCredentialsDocument extends CredentialsDocumentBase {
  passwordHash: string;
  type: 'password';
}

export interface OAuth2CredentialsDocument extends CredentialsDocumentBase {
  provider: 'google';
  type: 'oauth2';
}

export type CredentialsDocument = PasswordCredentialsDocument | OAuth2CredentialsDocument;

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
 *
 */
export const collectionMeta = {
  get credentials() {
    return {
      name: readConfig('database.users-credentials-collection.name'),
    };
  },
  get nonces() {
    return {
      name: readConfig('database.users-nonces-collection.name'),
    };
  },
  get permissions() {
    return {
      name: readConfig('database.users-permissions-collection.name'),
    };
  },
  get profiles() {
    return {
      name: readConfig('database.users-profiles-collection.name'),
    };
  },
}

/**
 * Database object
 */
export const database = {
  get credentials() {
    const databaseName = readConfig('database.users.name');
    const credentialsCollectionName = readConfig('database.users-credentials-collection.name');
    guard: {
      if (credentialsCollectionName === undefined) break guard;
      if (credentialsCollectionName === '') break guard;
      return mongoClient.db(databaseName).collection<CredentialsDocument>(credentialsCollectionName);
    }
    throw new Error(`Missing config file: database.users-credentials-collection.name`);
  },
  get nonces() {
    const databaseName = readConfig('database.users.name');
    const noncesCollectionName = readConfig('database.users-nonces-collection.name');
    guard: {
      if (noncesCollectionName === undefined) break guard;
      if (noncesCollectionName === '') break guard;
      return mongoClient.db(databaseName).collection<NonceDocument>(noncesCollectionName);
    }
    throw new Error(`Missing config file: database.users-nonces-collection.name`);
  },
  get permissions() {
    const databaseName = readConfig('database.users.name');
    const permissionsCollectionName = readConfig('database.users-permissions-collection.name');
    guard: {
      if (permissionsCollectionName === undefined) break guard;
      if (permissionsCollectionName === '') break guard;
      return mongoClient.db(databaseName).collection<PermissionsDocument>(permissionsCollectionName);
    }
    throw new Error(`Missing config file: database.users-permissions-collection.name`);
  },
  get profiles() {
    const databaseName = readConfig('database.users.name');
    const profilesCollectionName = readConfig('database.users-profiles-collection.name');
    guard: {
      if (profilesCollectionName === undefined) break guard;
      if (profilesCollectionName === '') break guard;
      return mongoClient.db(databaseName).collection<ProfileDocument>(profilesCollectionName);
    }
    throw new Error(`Missing config file: database.users-profiles-collection.name`);
  },
}

/**
 * MongoDB Client
 */
export const client = mongoClient;
