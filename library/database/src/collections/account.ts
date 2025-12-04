import { read as readConfig } from "../helper/configs.js";
import { mongoClient } from "../client.js";

//
export type AccountDocument = {
  createdAt: Date;
  updatedAt: Date;
}

//
export type AccountBillingDocument = {
  createdAt: Date;
  updatedAt: Date;
}

//
export type AccountInvitationsDocument = {
  createdAt: Date;
  updatedAt: Date;
}

//
export type AccountMembershipsDocument =
| {
  createdAt: Date;
  updatedAt: Date;
  accountUUID: null,
  membershipType: 'owner' | 'member',
  resourceType: 'user',
  resourceUUID: string,
}

export type AccountProfilesDocument = {
  createdAt: Date;
  updatedAt: Date;
  uuid: string;
}

//
export type AcccountTenantsDocument = {
  createdAt: Date;
  updatedAt: Date;
  label: string;
}

/**
 *
 */
export const collectionMeta = {
  get billing() {
    return {
      name: readConfig('database.account-billing-collection.name'),
    };
  },
  get invitations() {
    return {
      name: readConfig('database.account-invitations-collection.name'),
    };
  },
  get memberships() {
    return {
      name: readConfig('database.account-memberships-collection.name'),
    };
  },
  get profile() {
    return {
      name: readConfig('database.account-profile-collection.name'),
    };
  },
}

/**
 * Database object
 */
export const database = {
  get billing() {
    const databaseName = readConfig('database.account.name');
    const billingCollectionName = readConfig('database.account-billing-collection.name');
    guard: {
      if (billingCollectionName === undefined) break guard;
      if (billingCollectionName === '') break guard;
      return mongoClient.db(databaseName).collection<AccountBillingDocument>(billingCollectionName);
    }
    throw new Error(`Missing config: database.account-billing-collection.name`);
  },
  get invitations() {
    const databaseName = readConfig('database.account.name');
    const invitationsCollectionName = readConfig('database.account-invitations-collection.name');
    guard: {
      if (invitationsCollectionName === undefined) break guard;
      if (invitationsCollectionName === '') break guard;
      return mongoClient.db(databaseName).collection<AccountInvitationsDocument>(invitationsCollectionName);
    }
    throw new Error(`Missing config: database.account-invitations-collection.name`);
  },
  get memberships() {
    const databaseName = readConfig('database.account.name');
    const membershipsCollectionName = readConfig('database.account-memberships-collection.name');
    guard: {
      if (membershipsCollectionName === undefined) break guard;
      if (membershipsCollectionName === '') break guard;
      return mongoClient.db(databaseName).collection<AccountMembershipsDocument>(membershipsCollectionName);
    }
    throw new Error(`Missing config: database.account-memberships-collection.name`);
  },
  get profiles() {
    const databaseName = readConfig('database.account.name');
    const profilesCollectionName = readConfig('database.account-profiles-collection.name');
    guard: {
      if (profilesCollectionName === undefined) break guard;
      if (profilesCollectionName === '') break guard;
      return mongoClient.db(databaseName).collection<AccountProfilesDocument>(profilesCollectionName);
    }
    throw new Error(`Missing config: database.account-profiles-collection.name`);
  },
}

/**
 * MongoDB Client
 */
export const client = mongoClient;
