declare global {
  namespace NodeJS {
    interface ProcessEnv {
      ASSIGNMENT_DATABASE_NAME: string;
      ASSIGNMENT_DATABASE_PERMISSION_COLLECTION_NAME: string;
    }
  }
}
export {};
