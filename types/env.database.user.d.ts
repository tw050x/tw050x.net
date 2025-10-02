declare global {
  namespace NodeJS {
    interface ProcessEnv {
      USER_DATABASE_NAME: string;
      USER_DATABASE_CREDENTIALS_COLLECTION_NAME: string;
      USER_DATABASE_NONCES_COLLECTION_NAME: string;
      USER_DATABASE_PERMISSIONS_COLLECTION_NAME: string;
      USER_DATABASE_PROFILE_COLLECTION_NAME: string;
    }
  }
}
export {};
