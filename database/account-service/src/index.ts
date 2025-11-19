import { mongoClient } from "./client";

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
export type AccountInvitationDocument = {
  createdAt: Date;
  updatedAt: Date;
}

//
export type AccountMembershipDocument =
| {
  createdAt: Date;
  updatedAt: Date;
  accountUUID: null,
  membershipType: 'owner' | 'member',
  resourceType: 'user',
  resourceUUID: string,
}

export type AccountProfileDocument = {
  createdAt: Date;
  updatedAt: Date;
  uuid: string;
}

//
export type AcccountTenantDocument = {
  createdAt: Date;
  updatedAt: Date;
  label: string;
}

/**
 * Database object
 */
export const database = {
  get billing() {
    const billingCollectionName = process.env.ACCOUNT_DATABASE_BILLING_COLLECTION_NAME;
    guard: {
      if (billingCollectionName === undefined) break guard;
      if (billingCollectionName === '') break guard;
      return mongoClient.db(process.env.ACCOUNT_DATABASE_NAME).collection<AccountBillingDocument>(billingCollectionName);
    }
    throw new Error(`Missing environment variable: ACCOUNT_DATABASE_BILLING_COLLECTION_NAME`);
  },
  get invitation() {
    const invitationCollectionName = process.env.ACCOUNT_DATABASE_INVITATION_COLLECTION_NAME;
    guard: {
      if (invitationCollectionName === undefined) break guard;
      if (invitationCollectionName === '') break guard;
      return mongoClient.db(process.env.ACCOUNT_DATABASE_NAME).collection<AccountInvitationDocument>(invitationCollectionName);
    }
    throw new Error(`Missing environment variable: ACCOUNT_DATABASE_INVITATION_COLLECTION_NAME`);
  },
  get membership() {
    const membershipCollectionName = process.env.ACCOUNT_DATABASE_MEMBERSHIP_COLLECTION_NAME;
    guard: {
      if (membershipCollectionName === undefined) break guard;
      if (membershipCollectionName === '') break guard;
      return mongoClient.db(process.env.ACCOUNT_DATABASE_NAME).collection<AccountMembershipDocument>(membershipCollectionName);
    }
    throw new Error(`Missing environment variable: ACCOUNT_DATABASE_MEMBERSHIP_COLLECTION_NAME`);
  },
  get profile() {
    const profileCollectionName = process.env.ACCOUNT_DATABASE_PROFILE_COLLECTION_NAME;
    guard: {
      if (profileCollectionName === undefined) break guard;
      if (profileCollectionName === '') break guard;
      return mongoClient.db(process.env.ACCOUNT_DATABASE_NAME).collection<AccountProfileDocument>(profileCollectionName);
    }
    throw new Error(`Missing environment variable: ACCOUNT_DATABASE_PROFILE_COLLECTION_NAME`);
  },
}

/**
 * MongoDB Client
 */
export const client = mongoClient;
