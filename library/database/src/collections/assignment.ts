import { read as readConfig } from "../helper/configs.js";
import { DatabaseDocument } from "../types.js"
import { mongoClient } from "../client.js";

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
  get tasks() {
    return {
      name: readConfig('database.assignments-tasks-collection.name'),
    };
  },
  get tasksTemplates() {
    return {
      name: readConfig('database.assignments-tasks-templates-collection.name'),
    };
  },
}

/**
 * Database object
 */
export const database = {
  get tasks() {
    const databaseName = readConfig('database.assignments.name');
    const taskCollectionName = collectionMeta.tasks.name;
    guard: {
      if (taskCollectionName === '') break guard;
      return mongoClient.db(databaseName).collection<AssignmentTaskDocument>(taskCollectionName);
    }
    throw new Error(`Missing config file missing: database.assignments-tasks-collection.name`);
  },
  get tasksTemplates() {
    const databaseName = readConfig('database.assignments.name');
    const taskTemplateCollectionName = collectionMeta.tasksTemplates.name;
    guard: {
      if (taskTemplateCollectionName === '') break guard;
      return mongoClient.db(databaseName).collection<AssignmentTaskTemplateDocument>(taskTemplateCollectionName);
    }
    throw new Error(`Missing config file missing: database.assignments-tasks-templates-collection.name`);
  }
}

/**
 * MongoDB Client
 */
export const client = mongoClient;
