declare global {
  namespace NodeJS {
    interface ProcessEnv {
      ASSIGNMENT_DATABASE_NAME: string;
      ASSIGNMENT_DATABASE_TASK_COLLECTION_NAME: string;
      ASSIGNMENT_DATABASE_TASK_TEMPLATE_COLLECTION_NAME: string;
    }
  }
}
export {};
