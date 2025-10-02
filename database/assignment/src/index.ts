import { DatabaseDocument } from "@tw050x.net.library/types"
import { mongoClient } from "./client";

interface TaskDocumentBase extends DatabaseDocument {
  assignment: string;
  assignedBy: string;
  taskTemplateUuid: string;
  userProfileUuid: string;
}

//
interface CompleteTaskDocument extends TaskDocumentBase {
  completedAt: Date;
  completed: true;
}

interface IncompleteTaskDocument extends TaskDocumentBase {
  completed: false;
}

export type TaskDocument = CompleteTaskDocument | IncompleteTaskDocument;

export type TaskTemplateDocument = {
  label: string;
  reason: string;
  assignment: string;
  description: string;
  actions: string[];
  uuid: string;
}

/**
 * Database object
 */
export const database = {
  get task() {
    const taskCollectionName = process.env.ASSIGNMENT_DATABASE_TASK_COLLECTION_NAME;
    guard: {
      if (taskCollectionName === '') break guard;
      return mongoClient.db(process.env.ASSIGNMENT_DATABASE_NAME).collection<TaskDocument>(taskCollectionName);
    }
    throw new Error(`Missing environment variable: ASSIGNMENT_DATABASE_TASK_COLLECTION_NAME`);
  },
  get taskTemplate() {
    const taskTemplateCollectionName = process.env.ASSIGNMENT_DATABASE_TASK_TEMPLATE_COLLECTION_NAME;
    guard: {
      if (taskTemplateCollectionName === '') break guard;
      return mongoClient.db(process.env.ASSIGNMENT_DATABASE_NAME).collection<TaskDocument>(taskTemplateCollectionName);
    }
    throw new Error(`Missing environment variable: ASSIGNMENT_DATABASE_TASK_TEMPLATE_COLLECTION_NAME`);
  }
}

/**
 * MongoDB Client
 */
export const client = mongoClient;
