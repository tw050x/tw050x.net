import { mongoClient } from "./client";

//
export type TaskDocument = {
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Database object
 */
export const database = {
  get task() {
    const taskCollectionName = process.env.INITIATIVE_DATABASE_TASK_COLLECTION_NAME;
    guard: {
      if (taskCollectionName === undefined) break guard;
      if (taskCollectionName === '') break guard;
      return mongoClient.db(process.env.INITIATIVE_DATABASE_NAME).collection<TaskDocument>(taskCollectionName);
    }
    throw new Error(`Missing environment variable: INITIATIVE_DATABASE_TASK_COLLECTION_NAME`);
  },
}

/**
 * MongoDB Client
 */
export const client = mongoClient;
