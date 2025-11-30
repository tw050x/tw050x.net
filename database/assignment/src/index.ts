import { DatabaseDocument } from "@tw050x.net.library/types"
import { mongoClient } from "./client.js";

interface AssignmentTaskDocumentBase extends DatabaseDocument {
  actions: Array<string>;
  assignment: string;
  assignedBy: string;
  description: string;
  label: string;
  reason: string;
  userProfileUuid: string;
}

//
interface AssignmentCompleteTaskDocument extends AssignmentTaskDocumentBase {
  completedAt: Date;
  completed: true;
}

interface AssignmentIncompleteTaskDocument extends AssignmentTaskDocumentBase {
  completed: false;
}

export type AssignmentTaskDocument = AssignmentCompleteTaskDocument | AssignmentIncompleteTaskDocument;

export type AssignmentTaskTemplateDocument = {
  actions: string[];
  assignment: string;
  description: string;
  label: string;
  reason: string;
}

/**
 *
 */
export const collectionMeta = {
  get task() {
    return {
      name: process.env.ASSIGNMENT_DATABASE_TASK_COLLECTION_NAME
    };
  },
  get taskTemplate() {
    return {
      name: process.env.ASSIGNMENT_DATABASE_TASK_TEMPLATE_COLLECTION_NAME
    };
  }
}

/**
 * Database object
 */
export const database = {
  get task() {
    const taskCollectionName = collectionMeta.task.name;
    guard: {
      if (taskCollectionName === '') break guard;
      return mongoClient.db(process.env.ASSIGNMENT_DATABASE_NAME).collection<AssignmentTaskDocument>(taskCollectionName);
    }
    throw new Error(`Missing environment variable: ASSIGNMENT_DATABASE_TASK_COLLECTION_NAME`);
  },
  get taskTemplate() {
    const taskTemplateCollectionName = collectionMeta.taskTemplate.name;
    guard: {
      if (taskTemplateCollectionName === '') break guard;
      return mongoClient.db(process.env.ASSIGNMENT_DATABASE_NAME).collection<AssignmentTaskTemplateDocument>(taskTemplateCollectionName);
    }
    throw new Error(`Missing environment variable: ASSIGNMENT_DATABASE_TASK_TEMPLATE_COLLECTION_NAME`);
  }
}

/**
 * MongoDB Client
 */
export const client = mongoClient;
