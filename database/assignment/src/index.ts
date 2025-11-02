import { DatabaseDocument } from "@tw050x.net.library/types"
import { ObjectId } from "mongodb";
import { mongoClient } from "./client";

interface AssignmentTaskDocumentBase extends DatabaseDocument {
  assignment: string;
  assignedBy: string;
  assignmentTaskTemplateUuid: string;
  userProfileId: ObjectId;
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
  label: string;
  reason: string;
  assignment: string;
  description: string;
  actions: string[];
  uuid: string;
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
