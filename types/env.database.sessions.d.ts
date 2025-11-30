declare global {
  namespace NodeJS {
    interface ProcessEnv {
      SESSIONS_DATABASE_NAME: string;
      SESSIONS_DATABASE_ACTIVITY_COLLECTION_NAME: string;
      SESSIONS_DATABASE_LOGINS_COLLECTION_NAME: string;
    }
  }
}
export {};
